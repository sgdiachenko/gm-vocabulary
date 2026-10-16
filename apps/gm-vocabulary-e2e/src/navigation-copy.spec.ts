import { test, expect } from '@playwright/test';

test('shared copy survives deep links, navigation, reload and session expiry', async ({
  page,
  request,
}) => {
  const api = 'http://127.0.0.1:3000/api';
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const password = 'StructureTest123!';
  async function account(name: string) {
    const email = `${name}-${suffix}@example.com`;
    const signup = await request.post(`${api}/auth/signup`, {
      data: { email, username: name, password },
    });
    expect(signup.status()).toBe(201);
    const login = await request.post(`${api}/auth/login`, { data: { email, password } });
    expect(login.status()).toBe(200);
    const { token } = await login.json();
    return { email, headers: { Authorization: `Bearer ${token}` } };
  }
  const owner = await account('owner');
  const reader = await account('reader');
  const group = await request.post(`${api}/collections`, {
    headers: owner.headers,
    data: { name: `Shared ${suffix}`, isShared: true },
  });
  expect(group.status()).toBe(201);
  const { _id: groupId } = await group.json();
  const sharedWord = `shared-${suffix}`;
  const ownWord = `own-${suffix}`;
  for (const [headers, data] of [
    [owner.headers, { word: sharedWord, translation: 'спільне', groupId }],
    [reader.headers, { word: ownWord }],
  ] as const) {
    expect((await request.post(`${api}/words`, { headers, data })).status()).toBe(201);
  }

  await page.goto('/auth');
  await page.getByPlaceholder('Enter email').fill(reader.email);
  await page.getByPlaceholder('Enter password').fill(password);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/\/words$/);
  await expect(page.locator('gm-table')).toContainText(ownWord);
  await expect(page.locator('gm-table')).not.toContainText(sharedWord);

  // A direct URL exercises lazy loading and the SPA fallback with restored auth.
  await page.goto(`/collections/${groupId}`);
  await expect(page.locator('h2')).toContainText(`Shared ${suffix}`);
  await expect(page.locator('gm-table')).toContainText(sharedWord);
  await expect(page.locator('gm-table')).not.toContainText(ownWord);
  await page.reload();
  await expect(page.locator('gm-table')).toContainText(sharedWord);
  await page.locator('tr').filter({ hasText: sharedWord }).click();
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await expect(page.locator('mat-dialog-container')).toContainText(sharedWord);
  await page.locator('mat-dialog-container').getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  const copied = page.waitForResponse((response) => response.url().endsWith('/api/words/copy'));
  await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();
  expect((await copied).status()).toBe(201);
  await expect(page.locator('mat-dialog-container')).toHaveCount(0);

  await page.getByRole('button', { name: 'My Words' }).click();
  await expect(page.locator('gm-table')).toContainText(ownWord);
  await expect(page.locator('gm-table')).toContainText(sharedWord);
  await page.getByRole('button', { name: 'Library' }).click();
  await expect(page.locator('mat-card').filter({ hasText: `Shared ${suffix}` })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/words$/);
  await expect(page.locator('gm-table')).toContainText(ownWord);
  await page.reload();
  await expect(page.locator('gm-table')).toContainText(sharedWord);

  await page.evaluate(() => localStorage.setItem('expiresIn', new Date(0).toISOString()));
  await page.reload();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByPlaceholder('Enter email')).toBeVisible();
});
