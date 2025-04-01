import { Page, Locator } from '@playwright/test';

export class MapPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly mapContainer: Locator;
  readonly zoomInButton: Locator;
  readonly zoomOutButton: Locator;
  readonly addMarkerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /map/i }).first();
    // Map container could be a div with a specific class or role
    this.mapContainer = page.locator('[class*="map-container"]').or(page.locator('.mapboxgl-map'));
    // Common map control buttons
    this.zoomInButton = page.getByRole('button', { name: /zoom in/i }).or(page.locator('.mapboxgl-ctrl-zoom-in'));
    this.zoomOutButton = page.getByRole('button', { name: /zoom out/i }).or(page.locator('.mapboxgl-ctrl-zoom-out'));
    this.addMarkerButton = page.getByRole('button', { name: /add marker|add location|add pin/i });
  }

  async goto() {
    await this.page.goto('/map');
  }

  async waitForPageLoad() {
    await this.heading.waitFor({ state: 'visible' });
    // Wait for map to be loaded
    await this.mapContainer.waitFor({ state: 'visible' });
  }

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
    // Get the bounding box of the map container
    const boundingBox = await this.mapContainer.boundingBox();
    
    if (boundingBox) {
      // Calculate the position within the map container
      const clickX = boundingBox.x + x;
      const clickY = boundingBox.y + y;
      
      // Click at the specified position
      await this.page.mouse.click(clickX, clickY);
    }
  }

  async dragMap(fromX: number, fromY: number, toX: number, toY: number) {
    // Get the bounding box of the map container
    const boundingBox = await this.mapContainer.boundingBox();
    
    if (boundingBox) {
      // Calculate the start and end positions
      const startX = boundingBox.x + fromX;
      const startY = boundingBox.y + fromY;
      const endX = boundingBox.x + toX;
      const endY = boundingBox.y + toY;
      
      // Perform the drag operation
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY);
      await this.page.mouse.up();
    }
  }
} 