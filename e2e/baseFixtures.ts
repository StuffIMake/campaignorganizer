import { test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output');

console.log('[Coverage Fixture] Setting up coverage collection...');

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    console.log('[Coverage Fixture] Adding init script and expose function...');
    await context.addInitScript(() => {
      console.log('[Coverage Fixture - Browser] Adding beforeunload listener.');
      window.addEventListener('beforeunload', () => {
        console.log('[Coverage Fixture - Browser] beforeunload triggered.');
        // Note: Coverage might be partial here if page navigates away quickly
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__));
      });
    });

    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      console.log('[Coverage Fixture] collectIstanbulCoverage function called.');
      if (coverageJSON) {
        console.log(`[Coverage Fixture] Received coverage data (length: ${coverageJSON.length}). Attempting to write file...`);
        try {
          const filePath = path.join(istanbulCLIOutput, `coverage-${chromium.name()}-${Date.now()}-${Math.random()}.json`);
          fs.writeFileSync(filePath, coverageJSON);
          console.log(`[Coverage Fixture] Coverage file written to: ${filePath}`);
        } catch (error) {
          console.error('[Coverage Fixture] Error writing coverage file:', error);
        }
      } else {
        console.log('[Coverage Fixture] No coverage data received (coverageJSON was falsy).');
      }
    });
    console.log('[Coverage Fixture] Setup complete. Running test...');
    await use(context);
    // Ensure coverage is collected at the end of the test
    console.log('[Coverage Fixture] Test finished. Forcing coverage collection...');
    for (const page of context.pages()) {
      try {
        await page.evaluate(() => {
          console.log('[Coverage Fixture - Browser] Evaluating collectIstanbulCoverage call after test.');
          // Check if __coverage__ exists before stringifying
          const coverageData = (window as any).__coverage__;
          if (coverageData) {
            console.log('[Coverage Fixture - Browser] __coverage__ object found. Calling collectIstanbulCoverage.');
            (window as any).collectIstanbulCoverage(JSON.stringify(coverageData));
          } else {
            console.log('[Coverage Fixture - Browser] __coverage__ object NOT found after test.');
          }
        });
      } catch (error) {
         // Ignore errors if page is closed
         if (!error.message.includes('Target page, context or browser has been closed')) {
           console.error('[Coverage Fixture] Error during final coverage collection evaluation:', error);
         }
      }
    }
    console.log('[Coverage Fixture] Final coverage collection attempt finished.');
  },
});

export { expect } from '@playwright/test'; 