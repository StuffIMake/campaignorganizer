import { test, expect } from './baseFixtures';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';

test.describe('Map Page', () => {
  let homePage: HomePage;
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    mapPage = new MapPage(page);

    // Start at the home page and navigate to map
    await homePage.goto();
    await homePage.waitForPageLoad();

    const mapLink = page.getByRole('link', { name: /map/i }).first();
    await expect(mapLink, 'Map link should be visible').toBeVisible();
    await mapLink.click();

    // Verify navigation and wait for map to load
    await expect(page, 'Should navigate to map page URL').toHaveURL(/.*\/map/);
    await mapPage.waitForPageLoad(); // Waits for heading and map container
    await expect(mapPage.mapContainer, 'Map container should be visible').toBeVisible();
  });

  test('should allow zooming in and out', async ({ page }) => {
    // Wait for zoom controls
    await expect(mapPage.zoomInButton, 'Zoom in button should be visible').toBeVisible();
    await expect(mapPage.zoomOutButton, 'Zoom out button should be visible').toBeVisible();

    const initialZoom = await mapPage.getMapZoom();

    // Zoom In
    await mapPage.zoomIn();
    // Wait briefly for potential animation/update
    await page.waitForTimeout(500);
    const zoomAfterIn = await mapPage.getMapZoom();
    expect(zoomAfterIn, 'Zoom level should increase after zooming in').toBeGreaterThan(initialZoom);

    // Zoom Out
    await mapPage.zoomOut();
    await page.waitForTimeout(500); // Wait briefly for potential animation/update
    const zoomAfterOut = await mapPage.getMapZoom();
    // Check if zoom returned approximately to the initial level (allow for small float differences)
    expect(zoomAfterOut, 'Zoom level should decrease after zooming out').toBeLessThan(zoomAfterIn);
    expect(zoomAfterOut, 'Zoom level should be close to initial after zooming out').toBeCloseTo(initialZoom, 1); // Allow tolerance
  });

  test('should allow panning the map', async ({ page }) => {
    const initialCenter = await mapPage.getMapCenter();

    // Pan the map (adjust drag values if needed)
    await mapPage.dragMap(100, 100, 200, 150); // Drag from (100,100) to (200,150) within map container

    // Wait briefly for potential animation/update
    await page.waitForTimeout(500);

    const finalCenter = await mapPage.getMapCenter();

    // Verify center changed
    expect(finalCenter.lat, 'Latitude should change after panning').not.toBeCloseTo(initialCenter.lat);
    expect(finalCenter.lng, 'Longitude should change after panning').not.toBeCloseTo(initialCenter.lng);
  });

  // Add more tests here for other map features (markers, layers, etc.)
  // based on e2e/testing-plan.md
}); 