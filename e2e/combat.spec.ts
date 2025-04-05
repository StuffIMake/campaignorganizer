import { expect } from "@playwright/test";
import { test } from "./baseFixtures";

test.describe("Combat Feature", () => {
  // No longer need beforeEach for navigation, as withIndexedDB handles initial load
  // test.beforeEach(async ({ page }) => {
  //   const combatPath = "/campaignorganizer/combats";
  //   await page.goto(combatPath);
  //   await page.waitForURL(combatPath);
  // });

  test("should allow creating a new combat", async ({ page, withIndexedDB }) => {
    // Define minimal character data needed for the test
    const testCharacters = [
      { id: 'player-1', name: 'Player 1', type: 'player' }, // Basic player
      { id: 'enemy-goblin', name: 'Goblin', type: 'enemy' }, // Basic enemy
    ];

    // Setup IndexedDB using the fixture before navigating
    await withIndexedDB({ characters: testCharacters });

    // Now navigate to the specific page for the test
    const combatPath = "/campaignorganizer/combats";
    await page.goto(combatPath);
    await page.waitForURL(combatPath);
    // Wait for the main view to be ready after potential reload/navigation
    await expect(page.getByRole('button', { name: /add combat/i })).toBeVisible();

    // Add a pause to allow async data loading from IndexedDB into the store
    // Let's try a slightly longer pause for diagnostics
    await page.waitForTimeout(2000);

    const newCombatName = `Test Combat ${Date.now()}`;
    const playerCharacterName = "Player 1"; // Use the name we seeded
    const enemyCharacterName = "Goblin"; // Use the name we seeded

    // 1. Click the button to add a new combat
    await page.getByRole('button', { name: /add combat/i }).click();

    // Wait for the dialog to appear (check for title)
    const addDialogSelector = page.getByRole('dialog');
    await page.waitForTimeout(100);
    await expect(addDialogSelector).toBeVisible();
    await expect(addDialogSelector.locator('h3')).toContainText(/add new combat/i);

    // Add a short pause for diagnostic purposes - can potentially be removed later
    // await page.waitForTimeout(500); 

    // Pause execution for debugging with Playwright Inspector
    // console.log("Pausing test. Use Playwright Inspector to find the selector for the 'Name' input.");
    // await page.pause();

    // 2. Fill out the form within the dialog - Use getByRole now that component is fixed
    const dialog = addDialogSelector;

    // Fill name - Try getByRole with exact match
    // const nameInput = dialog.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox'); 
    const nameInput = dialog.getByLabel('Name');
    await expect(nameInput).toBeVisible(); // Keep the wait
    await nameInput.fill(newCombatName);

    // Select Player Characters - Use user provided selector
    // const playerAutocomplete = dialog.locator('div:has(> label:has-text("Select Players"))').getByRole('textbox');
    const playerAutocomplete = dialog.locator('div').filter({ hasText: /^Add Player Character$/ }).getByRole('combobox');
    await expect(playerAutocomplete).toBeVisible(); 
    await playerAutocomplete.click(); 
    await playerAutocomplete.fill(playerCharacterName); 
    
    // Wait directly for the LI element with the player name and then click it
    const playerOptionLocator = page.locator(`li:has-text("${playerCharacterName}")`);
    await expect(playerOptionLocator).toBeVisible();
    await playerOptionLocator.click();

    // Add Enemies - Use user provided selector
    // const enemyAutocomplete = dialog.locator('div:has(> label:has-text("Select an enemy to add"))').getByRole('textbox');
    const enemyAutocomplete = dialog.locator('div').filter({ hasText: /^Select an enemy to add$/ }).getByRole('combobox');
    await expect(enemyAutocomplete).toBeVisible(); 
    await enemyAutocomplete.click(); 
    await enemyAutocomplete.fill(enemyCharacterName); 
    
    // Wait directly for the LI element with the enemy name and then click it
    const enemyOptionLocator = page.locator(`li:has-text("${enemyCharacterName}")`);
    await expect(enemyOptionLocator).toBeVisible();
    await enemyOptionLocator.click();

    // Verify enemy is added to the list within the dialog
    await expect(dialog.getByRole('listitem').filter({ hasText: enemyCharacterName })).toBeVisible();
    await expect(dialog.getByRole('listitem').filter({ hasText: /count: 1/i })).toBeVisible(); // Check count

    // Add music/sounds/image - Placeholder for now, can be added later if needed
    // Example: await dialog.getByLabel(/background music/i).click();
    // Example: await page.getByRole('option', { name: 'Epic Battle Music' }).click();

    // 3. Submit the form - Wait for Save button to be enabled
    const saveButton = dialog.getByRole('button', { name: /^save$/i });
    await expect(saveButton).toBeEnabled({ timeout: 2000 }); // Wait up to 2s for button enable
    await saveButton.click();

    // 4. Verify the new combat appears in the list on the main page
    // Assuming CombatCard renders the name
    await expect(page.getByRole('heading', { name: newCombatName })).toBeVisible();

    // Optional: Verify participants are listed correctly in the card if shown
    // This depends on CombatCard implementation
    // Example: const combatCard = page.locator('.combat-card-class').filter({ hasText: newCombatName });
    // await expect(combatCard.getByText(playerCharacterName)).toBeVisible();
    // await expect(combatCard.getByText(enemyCharacterName)).toBeVisible();
  });

  test("should allow searching for combats", async ({ page, withIndexedDB }) => {
    const combat1Name = "Goblin Ambush";
    const combat2Name = "Dragon Lair";
    const testCombats = [
      { id: 'c1', name: combat1Name, description: 'Goblins attacking', playerCharacters: [], enemies: [], rewards: [], difficulty: 'easy' },
      { id: 'c2', name: combat2Name, description: 'Red dragon sleeping', playerCharacters: [], enemies: [], rewards: [], difficulty: 'hard' },
    ];

    // Seed combats
    await withIndexedDB({ 
      combats: testCombats 
      // characters: [ { id: 'p1', name: 'Dummy', type: 'player'} ] // Remove dummy char
    });

    const combatPath = "/campaignorganizer/combats";
    await page.goto(combatPath);
    await page.waitForURL(combatPath);
    await page.waitForSelector('button:has-text("Add Combat")'); 

    // Verify both combats are initially visible using data-testid
    const card1 = page.getByTestId(`combat-card-${testCombats[0].id}`);
    const card2 = page.getByTestId(`combat-card-${testCombats[1].id}`);
    await expect(card1).toBeVisible();
    await expect(card2).toBeVisible();

    // Find and fill the search input
    const searchInput = page.getByPlaceholder(/search combats by name/i);
    await searchInput.fill("Goblin");

    // Verify only combat 1 is visible
    await expect(card1).toBeVisible();
    await expect(card2).not.toBeVisible();

    // Clear the search
    const clearButton = page.getByLabel(/clear search/i);
    await clearButton.click();

    // Verify both are visible again
    await expect(card1).toBeVisible();
    await expect(card2).toBeVisible();
  });

  test("should allow editing an existing combat", async ({ page, withIndexedDB }) => {
    const originalName = "Test Edit Combat";
    const updatedName = "Test Edit Combat - Updated";
    const enemy1Name = "Goblin";
    const enemy2Name = "Orc";
    const combatId = "edit-test-combat";

    const initialCombat = {
      id: combatId, name: originalName, description: 'Initial', 
      playerCharacters: [], enemies: [{ id: 'enemy-goblin', name: enemy1Name }], 
      rewards: [], difficulty: 'easy' 
    };
    const testCharacters = [
      { id: 'enemy-goblin', name: enemy1Name, type: 'enemy' },
      { id: 'enemy-orc', name: enemy2Name, type: 'enemy' },
    ];

    await withIndexedDB({ combats: [initialCombat], characters: testCharacters });

    const combatPath = "/campaignorganizer/combats";
    await page.goto(combatPath);
    await page.waitForURL(combatPath);
    await page.waitForSelector('button:has-text("Add Combat")');

    // Find the initial combat card
    const combatCard = page.getByTestId(`combat-card-${combatId}`);
    await expect(combatCard).toBeVisible();

    // Find and click the Edit button using data-testid
    await combatCard.getByTestId(`edit-combat-${combatId}`).click();
    
    // Wait for the Edit dialog
    const dialog = page.getByRole('dialog', { name: /edit combat/i });
    await expect(dialog).toBeVisible();

    // Modify the name
    const nameInput = dialog.getByLabel('Name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(updatedName);

    // Remove original enemy (Goblin)
    // Assuming remove button is identifiable near the enemy list item
    const goblinListItem = dialog.getByRole('listitem').filter({ hasText: enemy1Name });
    await goblinListItem.getByRole('button', { name: /remove/i }).click();
    await expect(goblinListItem).not.toBeVisible();

    // Add new enemy (Orc)
    const enemyAutocomplete = dialog.locator('div').filter({ hasText: /^Select an enemy to add$/ }).getByRole('combobox');
    await enemyAutocomplete.click(); 
    await enemyAutocomplete.fill(enemy2Name);
    const enemyOptionLocator = page.locator(`li:has-text("${enemy2Name}")`);
    await expect(enemyOptionLocator).toBeVisible();
    await enemyOptionLocator.click();
    await expect(dialog.getByRole('listitem').filter({ hasText: enemy2Name })).toBeVisible();

    // Save changes
    const saveButton = dialog.getByRole('button', { name: /^save$/i });
    await expect(saveButton).toBeEnabled(); // Ensure enabled
    await saveButton.click();

    // Add a small wait after saving before checking the card
    await page.waitForTimeout(200); // e.g., 200ms pause

    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();

    // Verify the card is updated on the main page
    const updatedCard = page.getByTestId(`combat-card-${combatId}`); // ID remains the same
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.locator(`h2:has-text("${updatedName}")`)).toBeVisible();
    // Check for exact text match within the card for enemy presence/absence
    await expect(updatedCard.locator(`:text-is("${enemy1Name}")`)).not.toBeVisible(); // Check Goblin removed
    await expect(updatedCard.locator(`:text-is("${enemy2Name}")`)).toBeVisible(); // Check Orc added
  });

  test("should allow deleting a combat", async ({ page, withIndexedDB }) => {
    const combatName = "Combat To Delete";
    const combatId = "delete-test-combat";

    const initialCombat = {
      id: combatId, name: combatName, description: 'To be deleted', 
      playerCharacters: [], enemies: [], rewards: [], difficulty: 'easy' 
    };

    await withIndexedDB({ combats: [initialCombat] });

    const combatPath = "/campaignorganizer/combats";
    await page.goto(combatPath);
    await page.waitForURL(combatPath);
    await page.waitForSelector('button:has-text("Add Combat")');

    // Find the combat card
    const combatCard = page.getByTestId(`combat-card-${combatId}`);
    await expect(combatCard).toBeVisible();

    // Find and click the Delete button using data-testid
    await combatCard.getByTestId(`delete-combat-${combatId}`).click();
    
    // Wait for the confirmation dialog
    // Assuming title is "Confirm Deletion" based on CombatsView code
    const confirmDialog = page.getByRole('dialog', { name: /confirm deletion/i });
    await expect(confirmDialog).toBeVisible();

    // Click the final Delete button in the dialog
    await confirmDialog.getByRole('button', { name: /^delete$/i }).click();

    // Verify confirmation dialog is closed
    await expect(confirmDialog).not.toBeVisible();

    // Verify the card is removed from the main page
    await expect(combatCard).not.toBeVisible();
  });

  test("should allow initiating a combat from the combats view", async ({ page, withIndexedDB }) => {
    // Removed location seeding as it's not needed for this flow
    const combatName = "Skeleton Skirmish";
    const combatId = "combat-skirmish";
    const playerName = "Sir Reginald";
    const enemyName = "Skeleton";

    const testCombat = {
      id: combatId, name: combatName, 
      playerCharacters: [{ id: 'pc-reginald', name: playerName }],
      enemies: [{ id: 'e-skeleton', name: enemyName }],
      rewards: [], difficulty: 'easy'
    };
    const testCharacters = [
      { id: 'pc-reginald', name: playerName, type: 'player' },
      { id: 'e-skeleton', name: enemyName, type: 'enemy' },
    ];

    // Seed combat and characters
    await withIndexedDB({ 
      combats: [testCombat],
      characters: testCharacters 
    });

    // Navigate to Combats view
    const combatPath = "/campaignorganizer/combats";
    await page.goto(combatPath);
    await page.waitForURL(combatPath);
    await page.waitForSelector('button:has-text("Add Combat")');

    // Find combat card
    const combatCard = page.getByTestId(`combat-card-${combatId}`);
    await expect(combatCard).toBeVisible();

    // Find and click the "Start Combat" button within the card
    await combatCard.getByRole('button', { name: "Start Combat" }).click();
    
    // Verify navigation to the active combat view
    await expect(page).toHaveURL(/.*\/combat-session\?id=.*/);
    await expect(page.getByRole('heading', { name: /Combat: .*/ })).toBeVisible(); // Check main combat title

    // Verify participant names are visible using data-testid
    const playerTestIdName = playerName.replace(/\s+/g, '-');
    const enemyTestIdName = enemyName.replace(/\s+/g, '-');
    await expect(page.locator(`[data-testid="participant-item-${playerTestIdName}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="participant-item-${enemyTestIdName}"]`)).toBeVisible();

    // Verify round counter is visible
    await expect(page.getByText('Round 1')).toBeVisible();
  });

  // --- Add more tests here for other combat flows ---
}); 