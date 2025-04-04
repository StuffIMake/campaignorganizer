import { test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { setupIndexedDB, clearIndexedDB, StorageState } from './test-indexeddb/indexedDBHelper';

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output');


// Define the fixture types
interface TestFixtures {
  withIndexedDB: (data?: StorageState) => Promise<void>;
}

// Enhanced test definition with fixture for IndexedDB
export const test = baseTest.extend<TestFixtures>({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      window.addEventListener('beforeunload', () => {
        // Note: Coverage might be partial here if page navigates away quickly
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__));
      });
    });

    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON) {
        try {
          const filePath = path.join(istanbulCLIOutput, `coverage-${chromium.name()}-${Date.now()}-${Math.random()}.json`);
          fs.writeFileSync(filePath, coverageJSON);
        } catch (error) {
        }
      } else {
      }
    });
    await use(context);
    for (const page of context.pages()) {
      try {
        await page.evaluate(() => {
          // Check if __coverage__ exists before stringifying
          const coverageData = (window as any).__coverage__;
          if (coverageData) {
            (window as any).collectIstanbulCoverage(JSON.stringify(coverageData));
          }
        });
      } catch (error) {
         // Ignore errors if page is closed
         if (!error.message.includes('Target page, context or browser has been closed')) {
         }
      }
    }
  },

  // New fixture for IndexedDB setup
  withIndexedDB: async ({ page }, use) => {
    // Define a factory function that takes test data and sets up IndexedDB
    const setupTestIndexedDB = async (data: StorageState = {}) => {
      try {
        await setupIndexedDB(page, data);
      } catch (error) {
        throw error;
      }
    };

    // Pass the setup function to the test
    await use(setupTestIndexedDB);

    // Skip cleanup as it will be handled by browser context closure
    // This avoids the "page closed" errors
  },
});

export { expect } from '@playwright/test'; 