import { Page, Locator, expect } from '@playwright/test';

export class MapPage {
  readonly page: Page;
  // readonly heading: Locator; // Removed heading
  readonly mapViewContainer: Locator; // Container for the image viewer
  readonly mapImage: Locator; // The actual image element
  readonly loadingSpinner: Locator;
  // Remove Mapbox-specific buttons
  // readonly zoomInButton: Locator;
  // readonly zoomOutButton: Locator;
  // readonly addMarkerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // this.heading = page.getByRole('heading', { name: /map/i }).first(); // Removed
    // Locate the container of the react-zoom-pan-pinch component
    this.mapViewContainer = page.locator('.react-transform-wrapper').first(); // Assuming this class from the library
    // Locate the image within the viewer
    this.mapImage = page.locator('.react-transform-component img').first(); // Assuming this structure
    this.loadingSpinner = page.locator('[role="progressbar"]').first(); // MUI CircularProgress
    // Remove Mapbox button initializations
    // this.zoomInButton = page.getByRole('button', { name: /zoom in/i }).or(page.locator('.mapboxgl-ctrl-zoom-in'));
    // this.zoomOutButton = page.getByRole('button', { name: /zoom out/i }).or(page.locator('.mapboxgl-ctrl-zoom-out'));
    // this.addMarkerButton = page.getByRole('button', { name: /add marker|add location|add pin/i });
  }

  async goto() {
    await this.page.goto('/map');
  }

  async waitForPageLoad() {
    // Locate the outermost container using the ref's likely rendered element (div)
    const outerMapContainer = this.page.locator('div[class*="relative flex-1 h-full w-full overflow-hidden"]').first();
    await expect(outerMapContainer, 'Outer map view container should be visible').toBeVisible();
    
    // Also wait for the locations sidebar heading to ensure the main view structure is up
    await expect(this.page.locator('h6:has-text("Locations")').first(), 'Locations sidebar heading should be visible').toBeVisible();

    // Remove waits for elements that depend on location selection
    /*
    // Wait for the loading spinner to potentially appear and then disappear
    // Give it a slightly longer timeout as image loading might take time
    await expect(this.loadingSpinner, 'Loading spinner should eventually disappear').not.toBeVisible({ timeout: 20000 });

    // Now, wait for the react-zoom-pan-pinch container to be visible
    await expect(this.mapViewContainer, 'React-zoom-pan-pinch container should be visible').toBeVisible({ timeout: 10000 });

    // Finally, ensure the image itself is loaded and visible
    await expect(this.mapImage, 'Map image should be visible').toBeVisible({ timeout: 10000 });
    // Check if the image has a valid src attribute (not empty and not a placeholder/error)
    await expect(this.mapImage, 'Map image should have a valid src').toHaveAttribute('src', /^(?!data:).*$/);
    */
  }

  // Remove Mapbox-specific methods
  /*
  async zoomIn() {
    if (await this.zoomInButton.isVisible()) {
      await this.zoomInButton.click();
    }
  }

  async zoomOut() {
    if (await this.zoomOutButton.isVisible()) {
      await this.zoomOutButton.click();
    }
  }

  async clickOnMap(x: number, y: number) {
    const boundingBox = await this.mapContainer.boundingBox(); // mapContainer is now mapViewContainer
    if (boundingBox) {
      const clickX = boundingBox.x + x;
      const clickY = boundingBox.y + y;
      await this.page.mouse.click(clickX, clickY);
    }
  }

  async dragMap(fromX: number, fromY: number, toX: number, toY: number) {
    const boundingBox = await this.mapViewContainer.boundingBox(); // Use mapViewContainer
    if (boundingBox) {
      const startX = boundingBox.x + fromX;
      const startY = boundingBox.y + fromY;
      const endX = boundingBox.x + toX;
      const endY = boundingBox.y + toY;
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY);
      await this.page.mouse.up();
    }
  }

  async getMapZoom(): Promise<number> {
    // This is Mapbox specific - cannot get zoom level from image viewer easily
    throw new Error('getMapZoom is not applicable for the image viewer');
  }

  async getMapCenter(): Promise<{lng: number, lat: number}> {
    // This is Mapbox specific - cannot get center from image viewer
    throw new Error('getMapCenter is not applicable for the image viewer');
  }
  */
  
  // Add new method for dragging if needed, targeting mapViewContainer
  async dragImage(fromX: number, fromY: number, toX: number, toY: number) {
    const boundingBox = await this.mapImage.boundingBox();
    if (boundingBox) {
      const startX = boundingBox.x + fromX;
      const startY = boundingBox.y + fromY;
      const endX = boundingBox.x + toX;
      const endY = boundingBox.y + toY;
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.waitForTimeout(300);
      await this.page.mouse.move(endX, endY);
      await this.page.mouse.up();
    }
  }

  // Method to get the current transform style (might be useful for verifying pan/zoom)
  async getImageTransform(): Promise<string | null> {
    const transformComponent = this.page.locator('.react-transform-component').first();
    return transformComponent.getAttribute('style');
  }
} 