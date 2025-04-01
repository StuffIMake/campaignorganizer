import { Page, Locator } from '@playwright/test';

export class CharactersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addCharacterButton: Locator;
  readonly saveDataButton: Locator;
  readonly searchInput: Locator;
  readonly characterCards: Locator;
  readonly characterDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Characters' });
    this.addCharacterButton = page.getByRole('button', { name: /add character/i });
    this.saveDataButton = page.getByRole('button', { name: /save data/i });
    this.searchInput = page.getByRole('textbox', { name: /search characters/i }).or(page.getByPlaceholder('Search characters'));
    this.characterCards = page.locator('[class*="character-card"]');
    this.characterDialog = page.locator('dialog').or(page.locator('[role=dialog]'));
  }

  async goto() {
    await this.page.goto('/characters');
  }

  async waitForPageLoad() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async addCharacter(name: string, type: string = 'npc', description: string = 'Test description') {
    await this.addCharacterButton.click();
    
    // Wait for dialog to appear
    await this.characterDialog.waitFor({ state: 'visible' });
    
    // Fill in the form
    await this.page.getByLabel(/name/i).fill(name);
    await this.page.getByLabel(/type/i).selectOption(type);
    await this.page.getByLabel(/description/i).fill(description);
    
    // Submit the form
    await this.page.getByRole('button', { name: /save|add/i }).click();
    
    // Wait for dialog to disappear
    await this.characterDialog.waitFor({ state: 'hidden' });
  }

  async searchCharacters(query: string) {
    await this.searchInput.fill(query);
  }

  async getCharacterCardByName(name: string) {
    return this.page.locator(`text="${name}"`).first();
  }

  async editCharacter(name: string, newName: string) {
    // Find the character card
    const card = await this.getCharacterCardByName(name);
    
    // Find and click the edit button within the card
    await card.locator('button', { hasText: /edit/i }).click();
    
    // Wait for dialog to appear
    await this.characterDialog.waitFor({ state: 'visible' });
    
    // Change the name
    await this.page.getByLabel(/name/i).fill(newName);
    
    // Submit the form
    await this.page.getByRole('button', { name: /save|update/i }).click();
    
    // Wait for dialog to disappear
    await this.characterDialog.waitFor({ state: 'hidden' });
  }

  async deleteCharacter(name: string) {
    // Find the character card
    const card = await this.getCharacterCardByName(name);
    
    // Find and click the delete button within the card
    await card.locator('button', { hasText: /delete/i }).click();
    
    // Accept the confirmation dialog
    await this.page.getByRole('button', { name: /confirm|yes|ok/i }).click();
  }
} 