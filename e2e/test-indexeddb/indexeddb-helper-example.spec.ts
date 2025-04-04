import { test, expect } from '../baseFixtures';
import { HomePage } from '../pages/HomePage';
import { 
  setupFullCampaign, 
  setupSingleLocationCampaign,
  setupSingleCharacterCampaign
} from './test-helpers';

test.describe('IndexedDB Helper Functions Examples', () => {
  let homePage: HomePage;

  test('should load full campaign data', async ({ page, withIndexedDB }) => {
    // Use the helper function to set up a full campaign
    await setupFullCampaign(withIndexedDB);
    
    // Initialize page objects
    homePage = new HomePage(page);
    
    // Application is already loaded, verify it renders correctly
    await expect(page.getByRole('banner').getByText('Campaign Organizer')).toBeVisible();
    
    // Navigate to locations page and verify data
    const locationsLink = page.getByRole('link', { name: /locations/i }).first();
    await locationsLink.click();
    await page.waitForURL('**/locations');
    await page.waitForTimeout(2000);
    
    // Verify locations are present
    await expect(page.getByText('Misty Forest', { exact: true })).toBeVisible({ timeout: 5000 });
    
    // Navigate to characters page and verify data
    const charactersLink = page.getByRole('link', { name: /characters/i }).first();
    await charactersLink.click();
    await page.waitForURL('**/characters');
    await page.waitForTimeout(2000);
    
    // Verify characters are present
    await expect(page.getByText('Elder Thorne', { exact: true })).toBeVisible({ timeout: 5000 });
  });
  
  test('should load single location data', async ({ page, withIndexedDB }) => {
    // Use the helper function to set up a campaign with a single location
    await setupSingleLocationCampaign(withIndexedDB);
    
    // Initialize page objects
    homePage = new HomePage(page);
    
    // Navigate to locations page
    const locationsLink = page.getByRole('link', { name: /locations/i }).first();
    await locationsLink.click();
    await page.waitForURL('**/locations');
    await page.waitForTimeout(2000);
    
    // Verify test location is present
    await expect(page.getByText('Test Dungeon', { exact: true })).toBeVisible({ timeout: 5000 });
    
    // Verify full campaign locations are NOT present
    await expect(page.getByText('Misty Forest', { exact: true })).not.toBeVisible();
  });
  
  test('should load single character data', async ({ page, withIndexedDB }) => {
    // Use the helper function to set up a campaign with a single character
    await setupSingleCharacterCampaign(withIndexedDB);
    
    // Initialize page objects
    homePage = new HomePage(page);
    
    // Navigate to characters page
    const charactersLink = page.getByRole('link', { name: /characters/i }).first();
    await charactersLink.click();
    await page.waitForURL('**/characters');
    await page.waitForTimeout(2000);
    
    // Verify test character is present
    await expect(page.getByText('Test NPC', { exact: true })).toBeVisible({ timeout: 5000 });
    
    // Verify full campaign characters are NOT present
    await expect(page.getByText('Elder Thorne', { exact: true })).not.toBeVisible();
  });
}); 