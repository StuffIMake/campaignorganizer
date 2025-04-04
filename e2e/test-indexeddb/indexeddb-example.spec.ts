import { test, expect } from '../baseFixtures';
import { sampleLocations, sampleCharacters } from './testData';
import { HomePage } from '../pages/HomePage';

test.describe('IndexedDB Example Tests', () => {
  let homePage: HomePage;

  test('should load application with populated test data', async ({ page, withIndexedDB }) => {
    // Setup test data in IndexedDB
    // This will navigate to the app, set up data, and reload
    await withIndexedDB({
      locations: sampleLocations,
      characters: sampleCharacters
    });

    // Initialize page objects
    homePage = new HomePage(page);

    // Application is already loaded, verify it renders correctly
    await expect(page.getByRole('banner').getByText('Campaign Organizer')).toBeVisible();
    
    // Navigate to locations page
    const locationsLink = page.getByRole('link', { name: /locations/i }).first();
    await expect(locationsLink).toBeVisible();
    await locationsLink.click();
    
    // Wait for the URL to change
    await page.waitForURL('**/locations');
    
    // Give the app a moment to load and display the data
    await page.waitForTimeout(2000);
    
    // Check if our test locations are displayed in the locations list
    await expect(page.getByText('Misty Forest', { exact: true })).toBeVisible({ timeout: 5000 });

    // Find the Misty Forest item and click its expand toggle
    // Locate the div containing the h6 with the text "Misty Forest"
    const mistyForestItem = page.locator('div:has(> div > div > h6:has-text("Misty Forest"))').first();
    await expect(mistyForestItem).toBeVisible();
    // Locate the last button within that item (assuming it's the expand toggle)
    const expandButton = mistyForestItem.locator('button').last();
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    // Now check for the sublocations
    await expect(page.getByText('Abandoned Watchtower', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Hidden Cave', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('should load application with custom specific test data', async ({ page, withIndexedDB }) => {
    // Create custom test data for a specific test case
    const customLocations = [
      {
        id: 'custom-loc-1',
        name: 'Dragon Mountain',
        description: 'A massive mountain where ancient dragons dwell.',
        type: 'wilderness',
        parentLocationId: null,
        imageFile: null,
        audioFile: null,
        notes: 'Final area of the campaign.'
      }
    ];
    
    // Setup specific test data - this will navigate to the app, set up data, and reload
    await withIndexedDB({
      locations: customLocations
    });
    
    // Initialize page objects
    homePage = new HomePage(page);
    
    // Application is already loaded, verify it renders correctly
    await expect(page.getByRole('banner').getByText('Campaign Organizer')).toBeVisible();
    
    // Navigate to locations page
    const locationsLink = page.getByRole('link', { name: /locations/i }).first();
    await expect(locationsLink).toBeVisible();
    await locationsLink.click();
    
    // Wait for the URL to change
    await page.waitForURL('**/locations');
    
    // Give the app a moment to load and display the data
    await page.waitForTimeout(2000);
    
    // Verify custom location is displayed
    await expect(page.getByText('Dragon Mountain', { exact: true })).toBeVisible({ timeout: 5000 });
    
    // Verify other locations from the default data are NOT present
    await expect(page.getByText('Misty Forest', { exact: true })).not.toBeVisible();
  });
}); 