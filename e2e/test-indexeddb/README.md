# IndexedDB Testing for Playwright

This directory contains utilities and examples for testing with IndexedDB in Playwright. These tools allow you to populate IndexedDB with test data before running your tests, making it possible to test features that depend on data stored in IndexedDB.

## Key Files

- `indexedDBHelper.ts` - Core utilities for setting up and clearing IndexedDB data
- `testData.ts` - Sample test data that can be used in tests
- `indexeddb-example.spec.ts` - Example tests that demonstrate how to use the IndexedDB fixture

## How to Use

1. Import the `test` and `expect` from `../baseFixtures` in your test file:

```typescript
import { test, expect } from '../baseFixtures';
```

2. Use the `withIndexedDB` fixture in your test function:

```typescript
test('my test with IndexedDB data', async ({ page, withIndexedDB }) => {
  // Setup your test data
  await withIndexedDB({
    locations: myTestLocations,
    characters: myTestCharacters
  });
  
  // Test continues as normal...
});
```

3. The `withIndexedDB` function takes an object that can contain different types of data to be initialized in your IndexedDB:

```typescript
interface StorageState {
  locations?: any[];
  characters?: any[];
  // Add other data types as needed
}
```

4. After each test, the IndexedDB will be automatically cleared to ensure test isolation.

## Advanced Usage

### Creating Test-Specific Data Helpers

You can create helper functions to set up specific test scenarios:

```typescript
// test-helpers.ts
import { Page } from '@playwright/test';
import { sampleLocations, sampleCharacters } from './testData';

// Helper for setting up a complete campaign
export async function setupFullCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: sampleLocations,
    characters: sampleCharacters
  });
}

// Helper for setting up an empty campaign
export async function setupEmptyCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: [],
    characters: []
  });
}

// Helper for setting up a campaign with only specific data
export async function setupLocationsOnlyCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: sampleLocations
  });
}
```

Then use these helpers in your tests:

```typescript
import { test, expect } from '../baseFixtures';
import { setupFullCampaign } from './test-helpers';

test('should display all campaign data', async ({ page, withIndexedDB }) => {
  await setupFullCampaign(withIndexedDB);
  
  // Test with full campaign data
});
```

## Troubleshooting

- **Security Errors**: IndexedDB can only be accessed on secure origins (https) or localhost. Our helper handles this by navigating to the app first before attempting to access IndexedDB.
- **Multiple Elements Matching Selector**: Be specific with selectors. For example, use `page.getByRole('banner').getByText('Campaign Organizer')` instead of just `page.getByText('Campaign Organizer')`.
- **Timing Issues**: If your app has asynchronous data loading, remember to use appropriate waits like `page.waitForTimeout(2000)` or better, wait for specific elements to appear with `await expect(element).toBeVisible({ timeout: 5000 })`.

## Adding New Data Types

To add support for new data types:

1. Update the `StorageState` interface in `indexedDBHelper.ts`
2. Add the new data type handling in the `setupIndexedDB` function
3. Create sample test data in `testData.ts`

## Best Practices

- Keep test data minimal - only include what's needed for your specific test
- Ensure test isolation by using the fixture for each test that needs data
- Create specific data for each test case rather than reusing the same data across tests
- Use meaningful data that represents real-world scenarios

## Example

```typescript
test('should display character details', async ({ page, withIndexedDB }) => {
  // Setup custom character for this test
  await withIndexedDB({
    characters: [{
      id: 'test-char-1',
      name: 'Test Character',
      type: 'npc',
      // ... other character properties
    }]
  });
  
  // Navigate to characters page
  await page.goto('/characters');
  
  // Verify character is displayed
  await expect(page.getByText('Test Character')).toBeVisible();
  
  // Test interactions with the character
  await page.getByText('Test Character').click();
  
  // Assert character details are displayed
  await expect(page.getByText('NPC')).toBeVisible();
});
``` 