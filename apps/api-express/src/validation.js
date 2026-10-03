import { HttpError } from './http.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

function validateShape(body, allowed, required) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be an object');
  }
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length) {
    throw new HttpError(400, `Unknown fields: ${unknown.join(', ')}`);
  }
  for (const key of required) {
    if (!(key in body)) throw new HttpError(400, `${key} is required`);
  }
  return body;
}

function string(value, name, { optional = false, nonempty = false } = {}) {
  if ((value === undefined || value === null) && optional) return;
  if (typeof value !== 'string' || (nonempty && !value.trim())) {
    throw new HttpError(400, `${name} must be ${nonempty ? 'a nonempty' : 'a'} string`);
  }
}

function mongoId(value, name) {
  if (typeof value !== 'string' || !objectIdPattern.test(value)) {
    throw new HttpError(400, `${name} must be a MongoDB ObjectId`);
  }
}

export function signupInput(body) {
  const input = validateShape(body, ['username', 'email', 'password'], ['username', 'email', 'password']);
  string(input.username, 'username', { nonempty: true });
  string(input.email, 'email');
  string(input.password, 'password', { nonempty: true });
  if (!emailPattern.test(input.email)) throw new HttpError(400, 'email must be valid');
  const errors = [];
  if (input.password.length < 8) errors.push('Password must contain at least 8 characters');
  if (!/[a-z]/.test(input.password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[A-Z]/.test(input.password)) errors.push('Password must contain at least one uppercase letter');
  if (!/\d/.test(input.password)) errors.push('Password must contain at least one number');
  if (!/[^A-Za-z0-9]/.test(input.password)) errors.push('Password must contain at least one special character');
  if (errors.length) throw new HttpError(400, errors);
  return { ...input, username: input.username.trim() };
}

export function loginInput(body) {
  const input = validateShape(body, ['email', 'password'], ['email', 'password']);
  string(input.email, 'email');
  string(input.password, 'password', { nonempty: true });
  if (!emailPattern.test(input.email)) throw new HttpError(400, 'email must be valid');
  return input;
}

export function wordInput(body, partial = false) {
  const input = validateShape(body, ['word', 'translation', 'description', 'groupId'], partial ? [] : ['word']);
  string(input.word, 'word', { optional: partial, nonempty: true });
  string(input.translation, 'translation', { optional: true });
  string(input.description, 'description', { optional: true });
  if (input.groupId !== undefined && input.groupId !== null) mongoId(input.groupId, 'groupId');
  return input;
}

export function collectionInput(body, partial = false) {
  const input = validateShape(body, ['name', 'isShared'], partial ? [] : ['name']);
  string(input.name, 'name', { optional: partial, nonempty: true });
  if (input.isShared !== undefined && input.isShared !== null && typeof input.isShared !== 'boolean') {
    throw new HttpError(400, 'isShared must be a boolean');
  }
  return input;
}

export function idsInput(body) {
  const input = validateShape(body, ['ids'], ['ids']);
  if (!Array.isArray(input.ids) || !input.ids.length) {
    throw new HttpError(400, 'ids must be a nonempty array');
  }
  input.ids.forEach((id) => mongoId(id, 'ids item'));
  return input.ids;
}

export function collectionsInput(body) {
  if (!Array.isArray(body) || !body.length) {
    throw new HttpError(400, 'Request body must be a nonempty array');
  }
  return body.map((item) => collectionInput(item));
}
