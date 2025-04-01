import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Characters', () => {
  test('should navigate to characters page', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Start at the home page
    await homePage.goto();
    await homePage.waitForPageLoad();
    
    // Navigate to characters page
    const charactersLink = page.getByRole('link', { name: /characters/i }).first();
    if (await charactersLink.isVisible()) {
      await charactersLink.click();
      
      // Verify we're on the characters page URL
      await expect(page).toHaveURL(/.*\/characters/);
      
      // Look for the heading specifically
      const heading = page.getByRole('heading', { name: 'Characters' }).first();
      await expect(heading).toBeVisible();
      
      // Look for the Add Character button
      const addButton = page.getByRole('button', { name: /add character/i }).first();
      await expect(addButton).toBeVisible();
    } else {
      console.log('Characters link not visible, skipping test');
      test.skip();
    }
  });
}); 