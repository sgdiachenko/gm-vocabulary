#!/usr/bin/env node
// Read-only collector for workflow-retro. Node stdlib only.
// Usage: node collect.mjs [<session-id>|latest] [--project-dir <dir>] [--repo <dir>]
// Emits one JSON object on stdout. Reads only numbers, timestamps, tool names, ids and
// repo-relative paths from transcripts; prompt, reply and tool_result text is never emitted.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const repo = flag('--repo') ?? process.cwd();
const projectDir =
  flag('--project-dir') ?? join(homedir(), '.claude', 'projects', repo.replace(/[^a-zA-Z0-9]/g, '-'));
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const want = positional[0] ?? 'latest';

if (!existsSync(projectDir)) fail(`project dir not found: ${projectDir}`);

const sessions = readdirSync(projectDir)
  .filter((f) => f.endsWith('.jsonl'))
  .map((f) => ({ id: f.slice(0, -6), mtime: statSync(join(projectDir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);
const session = want === 'latest' ? sessions[0] : sessions.find((s) => s.id.startsWith(want));
if (!session) fail(`session not found: ${want}`);

const readJsonl = (file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

const prices = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'prices.json'), 'utf8'));

// USD for one API response at list prices; null when the model is not in prices.json.
function priceMessage(model, u) {
  const p = prices.models[model];
  if (!p) return null;
  const input = u.input_tokens ?? 0;
  const read = u.cache_read_input_tokens ?? 0;
  const write = u.cache_creation_input_tokens ?? 0;
  const w1h = u.cache_creation?.ephemeral_1h_input_tokens ?? 0;
  const w5m = u.cache_creation?.ephemeral_5m_input_tokens ?? write - w1h;
  const r = p.longPromptOver && input + read + write > p.longPromptOver ? p.long : p;
  const web = (u.server_tool_use?.web_search_requests ?? 0) * (prices.webSearchUsdPer1000 / 1000);
  return (
    (input * r.input + w5m * r.cacheWrite5m + w1h * r.cacheWrite1h + read * r.cacheRead + (u.output_tokens ?? 0) * r.output) / 1e6 + web
  );
}

const hash = (v) => createHash('sha1').update(String(v)).digest('hex').slice(0, 8);
const repoPath = (p) => {
  if (typeof p !== 'string' || !isAbsolute(p)) return null;
  const rel = relative(repo, p);
  return rel && !rel.startsWith('..') ? rel : null; // never expose paths outside the repo
};

// One stream = one transcript (orchestrator or a sub-agent).
function analyze(records) {
  const messages = new Map(); // message.id -> best record (assistant lines repeat per content block)
  const toolUses = new Map(); // tool_use id -> { name, key, file }
  const toolResults = [];
  const apiRequests = records.filter((r) => r.type === 'api-request').length;
  const systemSubtypes = {};
  let first = Infinity;
  let last = -Infinity;

  for (const r of records) {
    const t = Date.parse(r.timestamp);
    if (!Number.isNaN(t)) {
      first = Math.min(first, t);
      last = Math.max(last, t);
    }
    if (r.type === 'system' && r.subtype) systemSubtypes[r.subtype] = (systemSubtypes[r.subtype] ?? 0) + 1;
    const content = r.message?.content;
    if (r.type === 'assistant' && r.message?.id) {
      const prev = messages.get(r.message.id);
      const out = r.message.usage?.output_tokens ?? 0;
      if (!prev || out >= (prev.message.usage?.output_tokens ?? 0)) messages.set(r.message.id, r);
      for (const b of Array.isArray(content) ? content : []) {
        if (b.type !== 'tool_use' || toolUses.has(b.id)) continue;
        const i = b.input ?? {};
        const file = repoPath(i.file_path ?? i.path);
        const key =
          b.name === 'Read'
            ? `${i.file_path}|${i.offset ?? 0}|${i.limit ?? ''}`
            : `${b.name}|${hash(JSON.stringify(i))}`;
        toolUses.set(b.id, { name: b.name, key: hash(key), file, readKey: b.name === 'Read' ? key : null });
      }
    }
    if (r.type === 'user' && Array.isArray(content)) {
      for (const b of content) {
        if (b.type !== 'tool_result') continue;
        const len = typeof b.content === 'string' ? b.content.length : JSON.stringify(b.content ?? '').length;
        toolResults.push({ id: b.tool_use_id, error: !!b.is_error, chars: len });
      }
    }
  }

  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  const byModel = {};
  for (const r of messages.values()) {
    const u = r.message.usage ?? {};
    const m = (byModel[r.message.model ?? 'unknown'] ??= { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, calls: 0, webSearches: 0, usd: 0, nonStandardSpeed: 0 });
    const usd = priceMessage(r.message.model, u);
    m.usd = usd === null || m.usd === null ? null : m.usd + usd;
    m.webSearches += u.server_tool_use?.web_search_requests ?? 0;
    if (u.speed && u.speed !== 'standard') m.nonStandardSpeed += 1;
    for (const [k, v] of [
      ['input', u.input_tokens],
      ['output', u.output_tokens],
      ['cacheRead', u.cache_read_input_tokens],
      ['cacheWrite', u.cache_creation_input_tokens],
    ]) {
      usage[k] += v ?? 0;
      m[k] += v ?? 0;
    }
    m.calls += 1;
  }

  const tools = {};
  const toolErrors = {};
  const reads = new Map(); // readKey -> { count, file, chars }
  const repeats = new Map(); // non-read key -> { tool, count }
  const fileChars = new Map();
  for (const u of toolUses.values()) {
    tools[u.name] = (tools[u.name] ?? 0) + 1;
    if (u.readKey) {
      const e = reads.get(u.readKey) ?? { file: u.file, count: 0, chars: 0 };
      e.count += 1;
      reads.set(u.readKey, e);
    } else {
      const e = repeats.get(u.key) ?? { tool: u.name, count: 0 };
      e.count += 1;
      repeats.set(u.key, e);
    }
  }
  for (const res of toolResults) {
    const u = toolUses.get(res.id);
    if (!u) continue;
    if (res.error) toolErrors[u.name] = (toolErrors[u.name] ?? 0) + 1;
    if (u.readKey) {
      const e = reads.get(u.readKey);
      if (e) e.chars += res.chars;
      if (u.file) fileChars.set(u.file, (fileChars.get(u.file) ?? 0) + res.chars);
    }
  }

  return {
    firstTs: Number.isFinite(first) ? new Date(first).toISOString() : null,
    lastTs: Number.isFinite(last) ? new Date(last).toISOString() : null,
    wallSeconds: Number.isFinite(first) ? Math.round((last - first) / 1000) : null,
    estimatedUsd: Object.values(byModel).some((m) => m.usd === null)
      ? null
      : Math.round(Object.values(byModel).reduce((a, m) => a + m.usd, 0) * 10000) / 10000,
    apiCalls: messages.size,
    apiRequestRecords: apiRequests,
    usage,
    byModel,
    tools,
    toolErrors,
    systemSubtypes,
    repeatedReads: [...reads.values()]
      .filter((e) => e.count > 1)
      .map((e) => ({ file: e.file ?? '(outside repo)', times: e.count, approxTokens: Math.round(e.chars / 4) }))
      .sort((a, b) => b.times - a.times)
      .slice(0, 15),
    repeatedOtherCalls: [...repeats.values()]
      .filter((e) => e.count > 1)
      .map((e) => ({ tool: e.tool, times: e.count }))
      .sort((a, b) => b.times - a.times)
      .slice(0, 15),
    filesRead: [...fileChars.entries()]
      .map(([file, chars]) => ({ file, approxTokens: Math.round(chars / 4) }))
      .sort((a, b) => b.approxTokens - a.approxTokens)
      .slice(0, 15),
    fileReadSet: [...new Set([...reads.values()].map((e) => e.file).filter(Boolean))],
  };
}

const mainRecords = readJsonl(join(projectDir, `${session.id}.jsonl`));
const main = analyze(mainRecords);

// Link each sub-agent to the orchestrator tool_use that spawned it.
const agentDir = join(projectDir, session.id, 'subagents');
const agents = [];
if (existsSync(agentDir)) {
  for (const f of readdirSync(agentDir).filter((n) => n.endsWith('.jsonl'))) {
    const id = f.slice(0, -6);
    const metaFile = join(agentDir, `${id}.meta.json`);
    const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')) : {};
    agents.push({
      agentId: id.replace(/^agent-/, '').slice(0, 8),
      type: meta.agentType ?? 'unknown',
      label: meta.description ?? null,
      spawnDepth: meta.spawnDepth ?? null,
      finished: meta.finished ?? null,
      ...analyze(readJsonl(join(agentDir, f))),
    });
  }
}
agents.sort((a, b) => (a.firstTs ?? '').localeCompare(b.firstTs ?? ''));

// Peak parallelism over agent intervals.
const edges = agents
  .filter((a) => a.firstTs)
  .flatMap((a) => [
    [Date.parse(a.firstTs), 1],
    [Date.parse(a.lastTs), -1],
  ])
  .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
let cur = 0;
let peak = 0;
for (const [, d] of edges) peak = Math.max(peak, (cur += d));

// Reads that more than one stream performed.
const seen = new Map();
for (const s of [{ name: 'orchestrator', ...main }, ...agents.map((a) => ({ name: `${a.type}:${a.agentId}`, ...a }))]) {
  for (const file of s.fileReadSet) seen.set(file, [...(seen.get(file) ?? []), s.name]);
}
const crossStreamReads = [...seen.entries()]
  .filter(([, who]) => who.length > 1)
  .map(([file, streams]) => ({ file, streams }))
  .sort((a, b) => b.streams.length - a.streams.length)
  .slice(0, 20);
for (const s of [main, ...agents]) delete s.fileReadSet;

// Reconcile against the session-level cost-state record (last one wins; cumulative).
const costStates = mainRecords.filter((r) => r.type === 'cost-state');
const cs = costStates[costStates.length - 1] ?? null;
const sum = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
const sumByModel = {};
const sumUsdByModel = {};
for (const s of [main, ...agents]) {
  for (const k of Object.keys(sum)) sum[k] += s.usage[k];
  for (const [model, m] of Object.entries(s.byModel)) {
    const t = (sumByModel[model] ??= { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    for (const k of Object.keys(t)) t[k] += m[k];
    sumUsdByModel[model] = m.usd === null || sumUsdByModel[model] === null ? null : (sumUsdByModel[model] ?? 0) + m.usd;
  }
}
const reconciliation = cs
  ? Object.entries(cs.modelUsage ?? {}).map(([model, m]) => {
      const mine = sumByModel[model] ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
      const rep = {
        input: m.inputTokens,
        output: m.outputTokens,
        cacheRead: m.cacheReadInputTokens,
        cacheWrite: m.cacheCreationInputTokens,
      };
      return {
        model,
        transcripts: mine,
        costState: rep,
        costStateUsd: m.costUSD,
        transcriptsUsd: sumUsdByModel[model] == null ? null : Math.round(sumUsdByModel[model] * 10000) / 10000,
        // Reported by Claude Code but absent from any transcript read (side calls, web search, titles).
        unattributed: Object.fromEntries(Object.keys(rep).map((k) => [k, Math.max(0, (rep[k] ?? 0) - mine[k])])),
        diffPct: Object.fromEntries(
          Object.keys(rep).map((k) => [k, rep[k] ? Math.round(((mine[k] - rep[k]) / rep[k]) * 1000) / 10 : null]),
        ),
      };
    })
  : null;

// Price table health: age, unknown models, and cost-state USD inside the [all 5m, all 1h] cache-write range.
const ageDays = Math.floor((Date.now() - Date.parse(prices.fetched)) / 86400000);
const usageModels = new Set([...Object.keys(cs?.modelUsage ?? {}), ...[main, ...agents].flatMap((x) => Object.keys(x.byModel))]);
const unknownModels = [...usageModels].filter((m) => !prices.models[m]);
const rangeCheck = Object.entries(cs?.modelUsage ?? {})
  .filter(([model]) => prices.models[model])
  .map(([model, m]) => {
    const p = prices.models[model];
    const cost = (r, w) =>
      (m.inputTokens * r.input + m.cacheCreationInputTokens * r[w] + m.cacheReadInputTokens * r.cacheRead + m.outputTokens * r.output) / 1e6 +
      (m.webSearchRequests ?? 0) * (prices.webSearchUsdPer1000 / 1000);
    const low = cost(p, 'cacheWrite5m');
    const high = cost(p.long ?? p, 'cacheWrite1h');
    const eps = 0.005;
    return {
      model,
      lowUsd: Math.round(low * 1e4) / 1e4,
      highUsd: Math.round(high * 1e4) / 1e4,
      costStateUsd: m.costUSD,
      status: m.costUSD >= low - eps && m.costUSD <= high + eps ? 'ok' : 'OUT_OF_RANGE',
      weak: !!p.long, // tiered model: the range is wide
    };
  });
const priceCheck = {
  fetched: prices.fetched,
  ageDays,
  stale: ageDays > 30,
  unknownModels,
  rangeCheck,
  refreshNeeded: ageDays > 30 || unknownModels.length > 0 || rangeCheck.some((r) => r.status !== 'ok'),
  refreshForced: args.includes('--refresh-prices'),
};

console.log(
  JSON.stringify(
    {
      session: session.id.slice(0, 8),
      repo: basename(repo),
      transcriptsRead: 1 + agents.length,
      dedupe: 'usage taken once per message.id (largest output_tokens record)',
      orchestrator: main,
      agents,
      totals: {
        usage: sum,
        peakParallelAgents: peak,
        cacheHitRatio: (() => {
          const d = sum.input + sum.cacheRead + sum.cacheWrite;
          return d ? Math.round((sum.cacheRead / d) * 1000) / 1000 : null;
        })(),
      },
      crossStreamReads,
      costState: cs && {
        totalUsdEstimated: cs.totalCostUSD,
        apiSeconds: Math.round(cs.totalAPIDuration / 1000),
        apiSecondsWithoutRetries: Math.round(cs.totalAPIDurationWithoutRetries / 1000),
        retrySeconds: Math.round((cs.totalAPIDuration - cs.totalAPIDurationWithoutRetries) / 1000),
        toolSeconds: Math.round(cs.totalToolDuration / 1000),
        wallSeconds: Math.round(cs.totalDuration / 1000),
        linesAdded: cs.totalLinesAdded,
        linesRemoved: cs.totalLinesRemoved,
        hasUnknownModelCost: cs.hasUnknownModelCost,
      },
      reconciliation,
      priceCheck,
      notes: [
        'costUSD is an estimate at API list prices, not a bill; subscription billing is N/A.',
        `USD per stream = tokens x list prices from prices.json (${prices.source}, fetched ${prices.fetched}); reconciliation compares it with the cost-state USD.`,
      ],
    },
    null,
    2,
  ),
);

function fail(msg) {
  console.error(msg);
  process.exit(1);
}
