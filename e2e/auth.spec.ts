import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const uniqueEmail = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
  const password = 'TestPassword123';

  test.beforeEach(async ({ page }) => {
    // Navigating to root should redirect to /auth if not logged in
    await page.goto('/');
  });

  test('should redirect unauthenticated user to /auth', async ({ page }) => {
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator('h1')).toHaveText('Login');
  });

  test('should show validation errors on invalid inputs', async ({ page }) => {
    // Go to Signup form
    await page.locator('a', { hasText: 'Signup' }).click();
    await expect(page.locator('h1')).toHaveText('Signup');

    const emailInput = page.getByPlaceholder('Enter email');
    const passwordInput = page.getByPlaceholder('Enter password');
    const repeatPasswordInput = page.getByPlaceholder('Repeat Password');
    const submitBtn = page.getByRole('button', { name: 'Submit' });

    // Inputs should be empty initially, and submit button should be disabled
    await expect(submitBtn).toBeDisabled();

    // Trigger validation on email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('mat-error')).toContainText(['Invalid email']);

    // Trigger validation on password and repeat password by making them dirty and empty
    await passwordInput.fill('a');
    await passwordInput.fill('');
    await passwordInput.blur();
    await repeatPasswordInput.fill('a');
    await repeatPasswordInput.fill('');
    await repeatPasswordInput.blur();

    const errors = page.locator('mat-error');
    await expect(errors).toContainText(['Invalid email', 'Field is required', 'Field is required']);
    await expect(submitBtn).toBeDisabled();
  });

  test('should sign up, log in, and log out successfully', async ({ page }) => {
    // 1. Sign Up
    await page.locator('a', { hasText: 'Signup' }).click();
    await expect(page.locator('h1')).toHaveText('Signup');

    await page.getByPlaceholder('Enter email').fill(uniqueEmail);
    await page.getByPlaceholder('Enter password').fill(password);
    await page.getByPlaceholder('Repeat Password').fill(password);

    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // After successful signup, it should switch back to Login view
    await expect(page.locator('h1')).toHaveText('Login');

    // 2. Try Login with incorrect password
    await page.getByPlaceholder('Enter email').fill(uniqueEmail);
    await page.getByPlaceholder('Enter password').fill('WrongPassword!');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify error message from backend shown in snackbar
    await expect(page.locator('mat-snack-bar-container')).toContainText('Password does not match');

    // 3. Login with correct credentials
    await page.getByPlaceholder('Enter password').fill(password);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Success should redirect to /words
    await expect(page).toHaveURL(/\/words/);
    await expect(page.locator('mat-toolbar')).toContainText('GM Vocabulary');

    // 4. Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Dialog confirmation modal should open
    await expect(page.locator('h2')).toContainText('Logout');
    // Confirm logout
    await page.getByRole('button', { name: 'Submit' }).click();

    // User should be back on /auth
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator('h1')).toHaveText('Login');
  });
});
