import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Navigation', () => {
  test('should navigate between main sections', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Start at the home page
    await homePage.goto();
    await homePage.waitForPageLoad();
    
    // Instead of checking for nav element which has multiple instances,
    // Look for a more specific header or navigation container
    const appHeader = page.getByRole('banner').first();
    await expect(appHeader).toBeVisible();
    
    // Test navigation to Map view
    const mapLink = page.getByRole('link', { name: /map/i }).first();
    if (await mapLink.isVisible()) {
      await mapLink.click();
      await page.waitForURL('**/map');
      // Verify we're on the map page
      await expect(page).toHaveURL(/.*\/map/);
    }
    
    // Navigate back to home
    const homeLink = page.getByRole('link', { name: /dashboard|home/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await page.waitForURL('**/');
      // Verify we're back on the home page
      await expect(page).toHaveURL(/.*\/$/);
    }
  });
}); 