import { test, expect, Page } from '@playwright/test';

test.describe('Collections Management', () => {
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
    // Go to collections page
    await page.getByRole('button', { name: 'Library' }).click();
    await expect(page).toHaveURL(/\/collections/);
  });

  test('should create, edit, view, and delete a collection', async ({ page }) => {
    const collectionName = `My Coll ${Date.now()}`;
    const updatedName = `${collectionName} Updated`;

    // 1. Add Collection
    await page.locator('mat-card', { hasText: 'Add collection' }).click();
    
    // Fill Name input (dialog title says "Add word")
    await expect(page.locator('h2')).toContainText('Add word');
    await page.getByPlaceholder('Name').fill(collectionName);
    
    // Toggle Share (slide toggle)
    const shareToggle = page.locator('mat-slide-toggle');
    await expect(shareToggle).toContainText('Share');
    await shareToggle.locator('button').click();
    await expect(shareToggle.locator('button')).toHaveAttribute('aria-checked', 'true');

    // Submit dialog
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();

    // Wait for dialog to close completely
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Expect the card to appear in "My Collections"
    const card = page.locator('mat-card').filter({ hasText: collectionName });
    await expect(card).toBeVisible();
    // Check if the share icon exists on the card since it's shared
    await expect(card.locator('mat-icon:has-text("share")')).toBeVisible();

    // 2. Edit Collection
    await card.locator('button').filter({ has: page.locator('mat-icon:has-text("edit")') }).click();
    await expect(page.locator('mat-dialog-container h2')).toContainText('Edit word');
    await page.getByPlaceholder('Name').fill(updatedName);
    
    // Submit edit dialog
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();

    // Wait for dialog to close completely
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Verify the card name is updated
    const updatedCard = page.locator('mat-card').filter({ hasText: updatedName });
    await expect(updatedCard).toBeVisible();

    // 3. View Collection details
    await updatedCard.click();
    await expect(page).toHaveURL(/\/collections\//);
    await expect(page.locator('h2')).toContainText(`Collection: ${updatedName}`);
    // Go back to Library
    await page.getByRole('button', { name: 'Library' }).click();
    await expect(page).toHaveURL(/\/collections/);

    // 4. Delete Collection
    await updatedCard.locator('button').filter({ has: page.locator('mat-icon:has-text("delete")') }).click();
    // Confirm delete in submit-dialog
    await expect(page.locator('mat-dialog-container h2')).toContainText('Delete');
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Submit' }).click();

    // Wait for dialog to close completely
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Expect the card to be removed
    await expect(updatedCard).not.toBeVisible();
  });
});
