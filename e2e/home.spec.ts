import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to the home page
    await homePage.goto();
    
    // Wait for the page to load
    await homePage.waitForPageLoad();
    
    // Verify that the page has loaded with the expected title
    await expect(page).toHaveTitle(/Campaign Organizer|DM Companion/);
    
    // Check that the body element is visible
    await expect(homePage.body).toBeVisible();
  });
}); 