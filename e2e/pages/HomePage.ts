import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForPageLoad() {
    await this.body.waitFor({ state: 'visible' });
  }
} 