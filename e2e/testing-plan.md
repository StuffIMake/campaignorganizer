# Playwright E2E Test Plan

This document outlines the planned end-to-end tests required to achieve comprehensive coverage for the Campaign Organizer application using Playwright. It should be used in conjunction with the `testing-guidelines.md`.

## Goal

Achieve robust test coverage for all critical user flows and features of the application.

## Test Organization

- Tests are organized by feature.
- Each feature has a dedicated `.spec.ts` file (e.g., `characters.spec.ts`).
- Page Object Models (POMs) are used to encapsulate page structure and interactions (`e2e/pages/`).

## Feature Test Plan

Below is a breakdown of the tests needed for each feature area:

---

### 1. General & Navigation (`navigation.spec.ts`)

-   **Current Status:** Basic navigation between Home and Map exists.
-   **Needed Tests:**
    -   [ ] Verify navigation links for *all* main sections (Dashboard, Map, Characters, Locations, Combats, Assets, Audio - where applicable) are present and functional.
    -   [ ] Test navigating *from* each section *to* every other section via main navigation.
    -   [ ] Test "Home"/Logo link returns to dashboard from each section.
    -   [ ] Test breadcrumb navigation (if applicable).
    -   [ ] Test browser back/forward button functionality between sections.
    -   [ ] Add smoke tests to ensure each primary page/feature loads without console errors.

---

### 2. Home / Dashboard (`home.spec.ts`, `HomePage.ts`)

-   **Current Status:** Basic page load and title check exist.
-   **Needed Tests:**
    -   [ ] Verify presence and visibility of key dashboard widgets/elements on load.
    -   [ ] Test interactions with dynamic dashboard elements (e.g., clicking cards, quick-access widgets).

---

### 3. Characters (`characters.spec.ts`, `CharactersPage.ts`)

-   **Current Status:** Navigation to page, check heading and "Add Character" button.
-   **Needed Tests:**
    -   **CRUD Operations:**
        -   [ ] Test opening "Add Character" form/modal.
        -   [ ] Test form validation (required fields, data types).
        -   [ ] Test successfully creating a new character + verify list update.
        -   [ ] Test viewing details of a created character.
        -   [ ] Test editing an existing character + verify changes.
        -   [ ] Test deleting a character + verify removal.
    -   **Interactions:**
        -   [ ] Test filtering/searching the character list.
        -   [ ] Test pagination (if applicable).

---

### 4. Map (`map.spec.ts`, `MapPage.ts`)

-   **Current Status:** Navigation to page, basic zoom/drag attempts.
-   **Needed Tests:**
    -   **Core Map Load:**
        -   [ ] Verify map container and base layer load correctly.
    -   **Interactions:**
        -   [ ] Reliably test zoom in/out buttons + verify effect.
        -   [ ] Reliably test panning/dragging the map.
    -   **Markers/Pins:** (Assuming functionality)
        -   [ ] Test adding a new marker/pin.
        -   [ ] Test clicking a marker/pin to view details.
        -   [ ] Test editing marker/pin details.
        -   [ ] Test deleting a marker/pin.
    -   **Layers:**
        -   [ ] Test switching map layers/overlays (if applicable).
    -   **Search:**
        -   [ ] Test searching for locations on the map (if applicable).

---

### 5. Locations (`locations.spec.ts`, `LocationsPage.ts` - *New*)

-   **Current Status:** No tests exist.
-   **Needed Tests:**
    -   [ ] Create `e2e/pages/LocationsPage.ts` POM.
    -   [ ] Create `e2e/locations.spec.ts`.
    -   [ ] Test navigation to the Locations feature/page.
    -   **CRUD Operations:**
        -   [ ] Test creating a new location.
        -   [ ] Test viewing location details.
        -   [ ] Test editing an existing location.
        -   [ ] Test deleting a location.
    -   **Integration:**
        -   [ ] Test linking locations to map markers (if applicable).
    -   **Interactions:**
        -   [ ] Test filtering/searching locations.

---

### 6. Combats (`combats.spec.ts`, `CombatsPage.ts` - *New*)

-   **Current Status:** No tests exist.
-   **Needed Tests:**
    -   [ ] Create `e2e/pages/CombatsPage.ts` POM.
    -   [ ] Create `e2e/combats.spec.ts`.
    -   [ ] Test navigation to the Combats feature/page.
    -   **Combat Flow:**
        -   [ ] Test starting a new combat.
        -   [ ] Test adding participants (characters/enemies).
        -   [ ] Test setting/rolling initiative + verify turn order.
        -   [ ] Test advancing turns/rounds.
        -   [ ] Test applying damage/healing + verify state changes.
        -   [ ] Test applying conditions (if applicable).
        -   [ ] Test removing participants.
        -   [ ] Test ending a combat.

---

### 7. Assets (`assets.spec.ts` - *New*)

-   **Current Status:** No tests exist.
-   **Needed Tests:**
    -   [ ] Create `e2e/assets.spec.ts`.
    -   [ ] Modify relevant POMs (e.g., `CharactersPage`, `LocationsPage`) for asset interactions OR create `AssetsPage.ts` if dedicated page exists.
    -   [ ] Test uploading various asset types (images, PDFs) + verify success/failure.
    -   [ ] Test viewing uploaded images (direct or via `AssetViewer`).
    -   [ ] Test viewing uploaded PDFs (via `PDFViewer`/`PDFViewerDialog`).
    -   [ ] Test deleting assets + verify removal.

---

### 8. Audio (`audio.spec.ts` - *New*)

-   **Current Status:** No tests exist.
-   **Needed Tests:**
    -   [ ] Create `e2e/audio.spec.ts`.
    -   [ ] Modify relevant POMs or create `AudioPage.ts` if dedicated page exists.
    -   [ ] Test adding/selecting audio tracks via `AudioTrackSelector`.
    -   [ ] Test basic playback controls (play, pause, stop) via `AudioTrackPanel`.
    -   [ ] Test volume control.
    -   [ ] (Advanced) Verify control states reflect playback status.

---

### 9. Component-Level Tests (Implicit)

-   **Approach:** Most components (`AppLoader`, `MarkdownContent`, `Navigation`, etc.) will be tested implicitly through the feature tests above.
-   **Needed:** Ensure component interactions are covered within the relevant feature specs. `Navigation` tests should be robust in `navigation.spec.ts`.

---

### 10. Responsiveness

-   **Current Status:** No specific responsiveness tests.
-   **Needed Tests:**
    -   [ ] Configure different viewport sizes in `playwright.config.ts`.
    -   [ ] Add test variants or specific tests verifying layout adjustments at different sizes (e.g., mobile navigation visibility/behavior).

---

### 11. Authentication/Authorization (If Applicable)

-   **Current Status:** To be determined if auth exists.
-   **Needed Tests (If Auth Exists):**
    -   [ ] Test login flow (valid/invalid credentials).
    -   [ ] Test logout flow.
    -   [ ] Test accessing protected routes before/after login.
    -   [ ] Test role-based access restrictions (if applicable).

---

*This plan should be updated as features are added or changed.* 