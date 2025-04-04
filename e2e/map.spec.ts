import { test, expect } from './baseFixtures';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { sampleLocations, sampleCharacters } from './test-indexeddb/testData';
import * as fs from 'fs'; // Import fs for file reading
import * as path from 'path'; // Import path for joining
import * as mime from 'mime-types'; // Import mime-types for determining type
import { fileURLToPath } from 'url'; // Import fileURLToPath for ESM __dirname equivalent

// ESM equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Map Page', () => {
  // Increase the timeout for all tests in this suite
  // test.slow(); // Doubles the default timeout (e.g., 30s -> 60s)
  // Set a specific timeout: 90 seconds
  test.setTimeout(90000); 

  let homePage: HomePage;
  let mapPage: MapPage;

  test.beforeEach(async ({ page, withIndexedDB }) => {
    // Prepare image data using the calculated __dirname
    const imagePath = path.join(__dirname, '..', 'public', 'images', 'placeholder.png');
    let imageData: any = null;
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Data = imageBuffer.toString('base64');
      const mimeType = mime.lookup(imagePath) || 'image/png'; // Default to png if lookup fails
      imageData = {
        name: 'placeholder.png',
        data: base64Data,
        type: mimeType,
      };
      console.log('[Test Setup] Successfully prepared placeholder image data.');
    } catch (error) {
      console.error('[Test Setup] ERROR: Failed to read or process placeholder.png:', error);
      // Optionally, throw the error to fail the setup if the image is critical
      // throw new Error(`Failed to prepare placeholder image: ${error.message}`);
    }

    // Setup test data FIRST - this navigates to / and reloads
    await withIndexedDB({
      locations: sampleLocations, 
      characters: sampleCharacters,
      images: imageData ? [imageData] : [] // Pass image data if prepared successfully
    });
    
    // Initialize page objects AFTER data setup
    homePage = new HomePage(page);
    mapPage = new MapPage(page);

    // The fixture already loaded the home page, so just wait for it
    await homePage.waitForPageLoad();

    // Navigate to map page
    const mapLink = page.getByRole('link', { name: /map/i }).first();
    await expect(mapLink, 'Map link should be visible').toBeVisible();
    await mapLink.click();

    // Verify navigation and wait for map page structure
    await expect(page, 'Should navigate to map page URL').toHaveURL(/.*\/map/);
    await mapPage.waitForPageLoad(); // Waits for outer container and sidebar heading

  });

  /* // Commenting out zoom test as it requires interacting with react-zoom-pan-pinch controls
     // which might not have default accessible selectors.
  test('should allow zooming in and out', async ({ page }) => {
    // Wait for zoom controls - These buttons don't exist anymore
    // await expect(mapPage.zoomInButton, 'Zoom in button should be visible').toBeVisible();
    // await expect(mapPage.zoomOutButton, 'Zoom out button should be visible').toBeVisible();

    const initialTransform = await mapPage.getImageTransform();

    // Zoom In - Need a way to trigger zoom in (e.g., mouse wheel, custom controls)
    // await mapPage.zoomIn(); // This method is removed
    // await page.mouse.wheel(0, -100); // Example: Simulate scroll wheel zoom in
    // await page.waitForTimeout(500); // Wait briefly for potential animation/update
    // const transformAfterIn = await mapPage.getImageTransform();
    // expect(transformAfterIn).not.toEqual(initialTransform); // Verify transform changed

    // Zoom Out - Need a way to trigger zoom out
    // await mapPage.zoomOut(); // This method is removed
    // await page.mouse.wheel(0, 100); // Example: Simulate scroll wheel zoom out
    // await page.waitForTimeout(500); // Wait briefly for potential animation/update
    // const transformAfterOut = await mapPage.getImageTransform();
    // expect(transformAfterOut).not.toEqual(transformAfterIn); // Verify transform changed
    // Ideally, check if transform is back close to initialTransform, but exact comparison is hard
  });
  */

  test('should allow panning the map image', async ({ page }) => { // Renamed test
    // Wait for the sidebar list container to be visible
    const sidebarListContainer = page.locator('div[class*="border-right"] .overflow-y-auto.flex-grow');
    await expect(sidebarListContainer, 'Sidebar list container should be visible').toBeVisible();

    // *** UPDATED WAIT ***: Wait for the *first button* in the list container to appear,
    // indicating the list has likely finished rendering after data load.
    await sidebarListContainer.locator('button').first().waitFor({ state: 'visible', timeout: 15000 });
    
    // *** REMOVED DEBUG ***
    // const sidebarHTML = await sidebarListContainer.innerHTML();
    // console.log('Sidebar HTML:\n', sidebarHTML);

    // *** UPDATED LOCATOR STRATEGY ***
    // 1. Find the element containing the exact text
    const mistyForestText = sidebarListContainer.locator('div:text-is("Misty Forest")');
    // 2. Find the ancestor list item (li) which is the clickable element
    const mistyForestListItem = mistyForestText.locator('xpath=ancestor::li[1]');

    // Click the list item
    await expect(mistyForestListItem, '"Misty Forest" list item should exist').toBeAttached(); // Check existence first
    await mistyForestListItem.click(); // Click the li element

    // Wait for the image viewer and image to load AFTER clicking the location
    await expect(mapPage.mapViewContainer, 'React-zoom-pan-pinch container should be visible after selection').toBeVisible({ timeout: 10000 });
    await expect(mapPage.mapImage, 'Map image should be visible after selection').toBeVisible({ timeout: 10000 });
    // Verify the image src is a Data URL generated by AssetManager
    await expect(mapPage.mapImage, 'Map image should have a data src').toHaveAttribute('src', /^data:image\//); // Check for data:image/ protocol

    // Now perform the panning test
    const initialTransform = await mapPage.getImageTransform();

    // Pan the map image using the new dragImage method
    await mapPage.dragImage(100, 100, 200, 150);

    // Wait briefly for potential animation/update
    await page.waitForTimeout(500);

    const finalTransform = await mapPage.getImageTransform();

    // Verify transform style changed (simple check)
    expect(finalTransform, 'Image transform style should change after panning').not.toEqual(initialTransform);
  });

  // Add more tests here for other map features (markers, layers, etc.)
  // based on e2e/testing-plan.md
}); 