import { test, expect, Page } from '@playwright/test';

test.describe('Words Management', () => {
  // Helper to register and login a new user
  async function registerAndLogin(page: Page) {
    const uniqueEmail = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const password = 'TestPassword123';

    await page.goto('/auth');
    await page.locator('a', { hasText: 'Signup' }).click();
    await page.getByPlaceholder('Enter email').fill(uniqueEmail);
    await page.getByPlaceholder('Enter password').fill(password);
    await page.getByPlaceholder('Repeat Password').fill(password);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for the view to switch back to Login
    await expect(page.locator('h1')).toHaveText('Login');

    // Fill login form
    await page.getByPlaceholder('Enter email').fill(uniqueEmail);
    await page.getByPlaceholder('Enter password').fill(password);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify redirected to words page
    await expect(page).toHaveURL(/\/words/);
    return { email: uniqueEmail, password };
  }

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('should add, edit, filter, and delete words', async ({ page }) => {
    // 1. Verify empty state initially
    await expect(page.locator('h1')).toHaveText('There are no words added');

    // 2. Add first word: "Apple" in a new collection "Fruits"
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('mat-dialog-container h2')).toContainText('Add word');
    
    await page.getByPlaceholder('Word').fill('Apple');
    await page.getByPlaceholder('Translation').fill('Яблуко');
    
    const collectionInput = page.getByPlaceholder('Collection');
    await collectionInput.fill('Fruits');
    // Click the "Add Fruits" custom option in the autocomplete list
    const panel = page.locator('.mat-mdc-autocomplete-panel');
    await expect(panel).toBeVisible();
    await panel.locator('mat-option').filter({ hasText: 'Fruits' }).first().click();
    await expect(panel).not.toBeVisible();
    
    // Submit dialog
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Verify "Apple" is in the table
    const table = page.locator('gm-table');
    await expect(table).toContainText('Apple');
    await expect(table).toContainText('Яблуко');
    await expect(table).toContainText('Fruits');

    // 3. Add second word: "Banana" in the same collection "Fruits"
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Word').fill('Banana');
    await page.getByPlaceholder('Translation').fill('Банан');
    await page.getByPlaceholder('Collection').fill('Fruits');
    // Click the existing "Fruits" option (not "Add Fruits" since it already exists)
    await expect(panel).toBeVisible();
    await panel.locator('mat-option').filter({ hasText: 'Fruits' }).first().click();
    await expect(panel).not.toBeVisible();
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // 4. Add third word: "Dog" in a new collection "Animals"
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Word').fill('Dog');
    await page.getByPlaceholder('Translation').fill('Собака');
    await page.getByPlaceholder('Collection').fill('Animals');
    await expect(panel).toBeVisible();
    await panel.locator('mat-option').filter({ hasText: 'Animals' }).first().click();
    await expect(panel).not.toBeVisible();
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Verify all three words are in the table
    await expect(table).toContainText('Apple');
    await expect(table).toContainText('Banana');
    await expect(table).toContainText('Dog');

    // 5. Test Filtering by Collection
    await page.getByRole('combobox', { name: 'Select Collection' }).click();
    await page.locator('mat-option').filter({ hasText: 'Fruits' }).first().click();

    // Now only Apple and Banana should be visible, Dog should not be in the table
    await expect(table).toContainText('Apple');
    await expect(table).toContainText('Banana');
    await expect(table).not.toContainText('Dog');

    // Clear filter (select "All")
    await page.getByRole('combobox', { name: 'Select Collection' }).click();
    await page.locator('mat-option').filter({ hasText: 'All' }).first().click();
    await expect(table).toContainText('Dog');

    // 6. Edit Word: "Apple" to "Green Apple"
    // Click the row containing "Apple" to select it
    await page.locator('tr').filter({ hasText: 'Apple' }).first().click();
    await page.getByRole('button', { name: 'Edit' }).click();
    
    await expect(page.locator('mat-dialog-container h2')).toContainText('Edit word');
    await page.getByPlaceholder('Word').fill('Green Apple');
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Verify change in table
    await expect(table).toContainText('Green Apple');
    await expect(table).not.toContainText(/^Apple$/);

    // 7. Delete Word: "Dog"
    // Click the row containing "Dog" to select it
    await page.locator('tr').filter({ hasText: 'Dog' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    
    await expect(page.locator('mat-dialog-container h2')).toContainText('Delete');
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Verify "Dog" is removed
    await expect(table).not.toContainText('Dog');
  });
});
