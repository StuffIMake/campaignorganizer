# Playwright E2E Testing Guidelines

This document outlines the guidelines and best practices for writing and maintaining end-to-end (E2E) tests for the Campaign Organizer application using Playwright.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
  - [All Tests](#all-tests)
  - [Specific Tests](#specific-tests)
  - [UI Mode](#ui-mode)
  - [Debugging](#debugging)
  - [HTML Report](#html-report)
- [Project Structure](#project-structure)
- [Page Object Model (POM)](#page-object-model-pom)
  - [Purpose](#purpose)
  - [Structure](#structure)
  - [Example](#example)
- [Writing Tests](#writing-tests)
  - [File Naming](#file-naming)
  - [Test Structure](#test-structure)
  - [Test Naming](#test-naming)
  - [Selectors](#selectors)
  - [Assertions](#assertions)
  - [Waiting Strategy](#waiting-strategy)
  - [Test Data](#test-data)
  - [Modularity and Independence](#modularity-and-independence)
- [Debugging Tests](#debugging-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Introduction

End-to-end tests simulate real user scenarios by interacting with the application through the browser. They are crucial for verifying that integrated components work together as expected and for catching regressions before they reach users. We use [Playwright](https://playwright.dev/) as our E2E testing framework.

## Getting Started

### Installation

Ensure you have Node.js and npm installed. Install project dependencies, including Playwright browsers:

```bash
npm install
npx playwright install --with-deps
```

### Environment Variables

List any required environment variables for running tests (e.g., base URL, test user credentials). Create a `.env` file if necessary (ensure it's in `.gitignore`).

```
# Example .env file
BASE_URL=http://localhost:5173
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password
```

*(Add specific variables needed for this project)*

## Running Tests

Use the following npm scripts defined in `package.json` to run the tests:

### All Tests

Runs all tests headlessly:

```bash
npm run test:e2e
```

### Specific Tests

Run a specific test file:

```bash
npm run test:e2e -- path/to/your.spec.ts
```

Run tests matching a specific title:

```bash
npm run test:e2e -g "Test description or name"
```

### UI Mode

Runs tests with the Playwright UI, allowing for time travel debugging:

```bash
npm run test:e2e:ui
```

### Debugging

Runs tests in debug mode (sets `PWDEBUG=1`):

```bash
npm run test:e2e:debug
```

### HTML Report

Opens the HTML report from the last test run:

```bash
npm run test:e2e:report
```

## Project Structure

- `e2e/` - Root directory for all E2E tests.
  - `pages/` - Contains Page Object Model (POM) classes. Each file corresponds to a page or significant reusable component.
  - `fixtures/` - (Optional) Directory for test data fixtures.
  - `*.spec.ts` - Test files containing test suites (`describe`) and test cases (`test`). Files should be named after the feature they test (e.g., `characters.spec.ts`).
  - `playwright.config.ts` - Playwright configuration file.
  - `testing-guidelines.md` - This file.

## Page Object Model (POM)

### Purpose

We **mandate** the use of the Page Object Model pattern. POMs encapsulate the selectors and interaction logic for a specific page or component. This makes tests:
- **Readable:** Test logic focuses on *what* the user does, not *how* the page is structured.
- **Maintainable:** If the UI changes, updates are localized to the POM file, not scattered across multiple tests.
- **Reusable:** Common actions (like login, navigation) can be defined once in the POM.

### Structure

Each POM class should:
- Accept `Page` (and potentially other fixtures) in its constructor.
- Define locators for elements on the page using `page.locator()`, `page.getByRole()`, etc. Prefer user-facing locators.
- Provide methods for interacting with the page (e.g., `fillUsername(username)`, `clickSubmit()`, `navigateTo()`).
- Methods should typically return `Promise<void>` or `Promise<relevant data>`.

### Example

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /log in/i });
    this.errorMessage = page.locator('.error-message'); // Example, prefer better selectors
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }
}
```

## Writing Tests

### File Naming

Use kebab-case, matching the feature under test: `feature-name.spec.ts` (e.g., `character-creation.spec.ts`, `map-markers.spec.ts`).

### Test Structure

- Use `test.describe('Feature Name', () => { ... });` to group related tests.
- Use `test('should perform a specific action or verify a state', async ({ page }) => { ... });` for individual test cases.
- Use `test.beforeEach(async ({ page }) => { ... });` for setup common to all tests in a `describe` block (e.g., logging in, navigating to the page).
- Use `test.afterEach(async ({ page }) => { ... });` for cleanup (e.g., deleting created test data).

### Test Naming

Test names should clearly describe the behavior being tested, following the pattern `should [do something] when [condition]`. Example: `should display an error message when login fails`.

### Selectors

- **Prioritize user-facing selectors:**
  1. `page.getByRole()` (most resilient)
  2. `page.getByLabel()`
  3. `page.getByPlaceholder()`
  4. `page.getByText()`
  5. `page.getByTestId()` (use `data-testid` attributes in the application code for stable selectors)
- **Avoid:**
  - Brittle XPath or complex CSS selectors tied to implementation details.
  - Selectors based on generated class names.
- Use Playwright's locator methods (`.first()`, `.last()`, `.filter()`, `.locator()`) to chain and refine selections when necessary.

### Assertions

- Use Playwright's built-in `expect()` assertions: `expect(locator).toBeVisible()`, `expect(page).toHaveURL()`, `expect(locator).toHaveText()`, etc.
- Make assertions specific. Avoid generic checks like `expect(element).toBeTruthy()`.
- Wait for conditions using web-first assertions (e.g., `await expect(locator).toBeVisible();`) which have auto-retrying built-in.

### Waiting Strategy

- **Rely on Auto-Waiting:** Playwright automatically waits for elements to be actionable before interacting with them and for assertions to pass.
- **Explicit Waits:** Use explicit waits *sparingly* only when auto-waiting isn't sufficient:
  - `await page.waitForURL('**/expected/path')`
  - `await page.waitForSelector('#some-element', { state: 'visible' })` (less preferred than locator assertions)
  - `await responsePromise` when waiting for specific network responses.
- **Avoid `page.waitForTimeout()`:** This introduces fixed delays and makes tests flaky and slow.

### Test Data

- **Avoid Hardcoding:** Don't hardcode test data directly in tests.
- **Strategies:**
  - **Setup/Teardown:** Use `beforeEach`/`afterEach` or `beforeAll`/`afterAll` to create and clean up necessary data (e.g., create a test user/character before tests, delete it after).
  - **API:** Use API calls (via `request` fixture) in setup hooks to create data faster and more reliably than UI interactions.
  - **Fixtures:** For complex setup or reusable data, consider creating custom Playwright fixtures.
- Ensure test data is unique or isolated to prevent test collisions if run in parallel.

### Modularity and Independence

- **Focus:** Each `test()` should focus on verifying a single scenario or user flow.
- **Independence:** Tests must be runnable independently and in any order. Do not rely on the state left by a previous test. Use `beforeEach` to ensure a clean state.
- **DRY (Don't Repeat Yourself):** Encapsulate repeated actions within POM methods or helper functions.

## Debugging Tests

- **Playwright Inspector:** `PWDEBUG=1 npm run test:e2e` opens the inspector for stepping through tests and exploring selectors.
- **UI Mode:** `npm run test:e2e:ui` provides time-travel debugging.
- `console.log()`: Use within tests for quick debugging output.
- **Trace Viewer:** Analyze detailed execution traces (HTML report) to understand failures. Configure in `playwright.config.ts`.
- **Browser Developer Tools:** Pause test execution (`await page.pause()`) to inspect the DOM and network requests in the browser's dev tools.

## CI/CD Integration

E2E tests are configured to run automatically via GitHub Actions (see `.github/workflows/playwright.yml`). Tests run on pushes/PRs to main branches. Ensure tests pass reliably in CI.

## Best Practices

- **Keep Tests Fast:** Optimize selectors, use API for setup where possible, run tests in parallel (configured in `playwright.config.ts`).
- **Handle Flakiness:** Identify and fix flaky tests promptly. Common causes include timing issues, race conditions, and reliance on unstable selectors. Use auto-waiting assertions and avoid fixed timeouts.
- **Code Reviews:** Treat test code like production code. Include tests in code reviews.
- **Maintainability:** Regularly refactor tests and POMs as the application evolves. Remove obsolete tests.
- **Test Coverage:** Aim for broad coverage of critical user flows, but prioritize quality over quantity. Not every single edge case needs an E2E test. Consider unit/integration tests for finer-grained checks.
- **Accessibility:** Consider incorporating basic accessibility checks (`axe-playwright`). 