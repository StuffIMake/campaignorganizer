# Playwright End-to-End Testing

This directory contains the end-to-end tests for the Campaign Organizer application using Playwright.

## Getting Started

To run the Playwright tests:

```bash
# Run all tests
npm run test:e2e

# Run tests with the UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View the HTML report of the last test run
npm run test:e2e:report
```

## Project Structure

- `e2e/` - Root directory for all E2E tests
  - `pages/` - Page Object Models (POMs) for different pages/components
  - `*.spec.ts` - Test files

## Page Object Model Pattern

We use the Page Object Model pattern to organize our tests. Each page or significant component has its own class that encapsulates its selectors and behavior. This makes tests more maintainable and readable.

Example:
```typescript
// e2e/pages/HomePage.ts
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
```

## Writing Tests

When writing new tests:

1. Create a new `.spec.ts` file for the feature you're testing
2. Use the Page Object Model pattern if it's a new page/component
3. Focus on testing user flows rather than implementation details
4. Use `test.describe()` and `test()` to organize your tests
5. Use descriptive test names that explain what you're testing

Example:
```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test specific behavior
    // ...
    
    // Assert expected outcomes
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## CI/CD Integration

Tests are automatically run on GitHub Actions when:
- Pushing to main/master branches
- Creating a pull request to main/master branches

The workflow configuration is in `.github/workflows/playwright.yml`. 