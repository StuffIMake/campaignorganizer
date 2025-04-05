import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Locations Feature', () => {
  const locationsUrl = '/campaignorganizer/locations';

  test.beforeEach(async ({ page }) => {
    // Navigate to the locations page before each test
    await page.goto(locationsUrl);
    // Optional: Add logic here to ensure a clean state, e.g., delete all existing locations
    // For now, we assume tests can run independently or handle existing data.
  });

  test('should allow creating a new top-level location', async ({ page }) => {
    const locationName = `Test Location ${uuidv4()}`;
    const locationDesc = 'A place created by Playwright';

    // 1. Click Add Location button
    await page.getByRole('button', { name: 'Add Location' }).click();

    // 2. Wait for and locate the dialog using its title heading
    const dialogTitle = page.getByRole('heading', { name: 'Add New Location' });
    await expect(dialogTitle).toBeVisible();
    // Locate the dialog container itself - we need this scope for getByLabel
    const dialog = page.locator('div[role="dialog"]:has(h3:has-text("Add New Location"))');

    // 3. Fill in the form using getByLabel within the dialog scope
    await dialog.getByLabel('Name').fill(locationName);
    await dialog.getByLabel('Description').fill(locationDesc);
    // We are skipping other fields for this basic test

    // 4. Click Save
    await dialog.getByRole('button', { name: 'Save' }).click();

    // 5. Verify dialog is closed
    await expect(dialogTitle).not.toBeVisible(); // Check if title is gone

    // 6. Verify the new location appears in the list
    const newItemTestId = `location-item-${locationName.replace(/\s+/g, '-')}`;
    await expect(page.locator(`[data-testid="${newItemTestId}"]`)).toBeVisible(); 
    await expect(page.getByTestId(newItemTestId).getByRole('heading', { name: locationName })).toBeVisible();
  });

  test('should display location details when selected', async ({ page }) => {
    const locationName = `Viewable Location ${uuidv4()}`;
    const locationDesc = 'Details to be viewed';
    const locationTestIdName = locationName.replace(/\s+/g, '-');

    // --- Create a location first ---
    await page.getByRole('button', { name: 'Add Location' }).click();
    const addDialogTitle = page.getByRole('heading', { name: 'Add New Location' });
    await expect(addDialogTitle).toBeVisible();
    const addDialog = page.locator('div[role="dialog"]:has(h3:has-text("Add New Location"))');
    await addDialog.getByLabel('Name').fill(locationName);
    await addDialog.getByLabel('Description').fill(locationDesc);
    await addDialog.getByRole('button', { name: 'Save' }).click();
    await expect(addDialogTitle).not.toBeVisible();
    // --- Location created ---

    // 1. Find the location item using data-testid
    const locationItem = page.locator(`[data-testid="location-item-${locationTestIdName}"]`);
    await expect(locationItem).toBeVisible();

    // 2. Click the view button within the item
    await locationItem.locator(`[data-testid="location-item-view-button-${locationTestIdName}"]`).click();

    // 3. Locate the description dialog title (which contains the name)
    const descriptionDialog = page.locator('div[role="dialog"]');
    await expect(descriptionDialog).toBeVisible();
    const descriptionDialogTitle = descriptionDialog.getByRole('heading', { name: locationName });
    await expect(descriptionDialogTitle).toBeVisible();

    // 4. Verify the description is visible within the dialog
    await expect(descriptionDialog.getByText(locationDesc)).toBeVisible();

    // 5. Close the dialog
    await descriptionDialog.getByRole('button', { name: 'Close' }).click();
    await expect(descriptionDialog).not.toBeVisible();
  });

  test('should allow updating an existing location', async ({ page }) => {
    const initialName = `Editable Location ${uuidv4()}`;
    const updatedName = `Updated Location ${uuidv4()}`;
    const initialDesc = 'Before update';
    const updatedDesc = 'After update';
    const initialTestIdName = initialName.replace(/\s+/g, '-');
    const updatedTestIdName = updatedName.replace(/\s+/g, '-');

    // --- Create a location first ---
    await page.getByRole('button', { name: 'Add Location' }).click();
    const addDialogTitle = page.getByRole('heading', { name: 'Add New Location' });
    await expect(addDialogTitle).toBeVisible();
    const addDialog = page.locator('div[role="dialog"]:has(h3:has-text("Add New Location"))');
    await addDialog.getByLabel('Name').fill(initialName);
    await addDialog.getByLabel('Description').fill(initialDesc);
    await addDialog.getByRole('button', { name: 'Save' }).click();
    await expect(addDialogTitle).not.toBeVisible();
    // --- Location created ---

    // 1. Find the location list item using data-testid
    const locationItem = page.locator(`[data-testid="location-item-${initialTestIdName}"]`);
    await expect(locationItem).toBeVisible();

    // 2. Click the Edit button within that item using data-testid
    await locationItem.getByTestId('location-item-edit-button').click();

    // 3. Wait for and locate the Edit dialog using its title heading
    const editDialogTitle = page.getByRole('heading', { name: 'Edit Location' });
    await expect(editDialogTitle).toBeVisible();
    const editDialog = page.locator('div[role="dialog"]:has(h3:has-text("Edit Location"))');

    // 4. Verify initial values and update the form
    await expect(editDialog.getByLabel('Name')).toHaveValue(initialName);
    await expect(editDialog.getByLabel('Description')).toHaveValue(initialDesc);
    await editDialog.getByLabel('Name').fill(updatedName);
    await editDialog.getByLabel('Description').fill(updatedDesc);

    // 5. Click Save
    await editDialog.getByRole('button', { name: 'Save' }).click();

    // 6. Verify dialog is closed
    await expect(editDialogTitle).not.toBeVisible();

    // 7. Verify the updated location item appears
    const updatedItem = page.locator(`[data-testid="location-item-${updatedTestIdName}"]`);
    await expect(updatedItem).toBeVisible();
    await expect(updatedItem.getByRole('heading', { name: updatedName })).toBeVisible();

    // 8. Verify the old location item is gone
    await expect(page.locator(`[data-testid="location-item-${initialTestIdName}"]`)).not.toBeVisible();
  });

  test('should allow deleting an existing location', async ({ page }) => {
    const locationName = `Deletable Location ${uuidv4()}`;
    const locationTestIdName = locationName.replace(/\s+/g, '-');

    // --- Create a location first ---
    await page.getByRole('button', { name: 'Add Location' }).click();
    const addDialogTitle_del = page.getByRole('heading', { name: 'Add New Location' });
    await expect(addDialogTitle_del).toBeVisible();
    const addDialog_del = page.locator('div[role="dialog"]:has(h3:has-text("Add New Location"))');
    await addDialog_del.getByLabel('Name').fill(locationName);
    await addDialog_del.getByRole('button', { name: 'Save' }).click();
    await expect(addDialogTitle_del).not.toBeVisible(); 
    // Verify creation using test-id
    await expect(page.locator(`[data-testid="location-item-${locationTestIdName}"]`)).toBeVisible(); 
    // --- Location created ---

    // 1. Find the location list item using data-testid
    const locationItem = page.locator(`[data-testid="location-item-${locationTestIdName}"]`);
    await expect(locationItem).toBeVisible();

    // 2. Click the Delete button within that item using data-testid
    await locationItem.getByTestId('location-item-delete-button').click();

    // 3. Handle the confirmation dialog
    // Playwright auto-accepts dialogs by default
    
    // 4. The UI should update after deletion - reload the page to ensure we're in a clean state
    await page.reload();
    
    // 5. Wait for page to load after refresh
    await page.waitForSelector('button:has-text("Add Location")');
    
    // 6. Verify the location item is gone from the list
    await expect(page.locator(`[data-testid="location-item-${locationTestIdName}"]`)).not.toBeVisible();
  });

  // Optional: Add tests for nested locations, searching/filtering, etc.

}); 