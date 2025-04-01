# Playwright E2E Test Progress

This document tracks the implementation progress of the E2E tests defined in `e2e/testing-plan.md`.

Mark items as complete (`- [x]`) as they are implemented and merged.

## Progress Tracker

---

### 1. General & Navigation (`navigation.spec.ts`)

-   **Needed Tests:**
    -   [x] Basic navigation (Home <-> Map) - *Partially covered by existing tests*
    -   [ ] Verify navigation links for *all* main sections
    -   [ ] Test navigating *from* each section *to* every other section
    -   [ ] Test "Home"/Logo link returns to dashboard
    -   [ ] Test breadcrumb navigation
    -   [ ] Test browser back/forward buttons
    -   [ ] Add smoke tests for primary pages

---

### 2. Home / Dashboard (`home.spec.ts`, `HomePage.ts`)

-   **Needed Tests:**
    -   [x] Basic page load and title check
    -   [ ] Verify dashboard widgets/elements visibility
    -   [ ] Test interactions with dynamic dashboard elements

---

### 3. Characters (`characters.spec.ts`, `CharactersPage.ts`)

-   **Needed Tests:**
    -   [x] Navigation to page
    -   [x] Check heading and "Add Character" button visibility
    -   **CRUD Operations:**
        -   [ ] Test opening "Add Character" form/modal
        -   [ ] Test form validation
        -   [ ] Test creating a new character + verification
        -   [ ] Test viewing character details
        -   [ ] Test editing a character + verification
        -   [ ] Test deleting a character + verification
    -   **Interactions:**
        -   [ ] Test filtering/searching characters
        -   [ ] Test pagination

---

### 4. Map (`map.spec.ts`, `MapPage.ts`)

-   **Needed Tests:**
    -   [x] Navigation to page
    -   **Core Map Load:**
        -   [ ] Verify map container and base layer load
    -   **Interactions:**
        -   [x] Basic zoom in/out attempt - *Needs reliable verification*
        -   [x] Basic panning/dragging attempt - *Needs reliable verification*
        -   [ ] Reliably test zoom + verify effect
        -   [ ] Reliably test panning/dragging
    -   **Markers/Pins:**
        -   [ ] Test adding a marker/pin
        -   [ ] Test viewing marker/pin details
        -   [ ] Test editing marker/pin details
        -   [ ] Test deleting a marker/pin
    -   **Layers:**
        -   [ ] Test switching map layers/overlays
    -   **Search:**
        -   [ ] Test searching for locations on map

---

### 5. Locations (`locations.spec.ts`, `LocationsPage.ts`)

-   **Needed Tests:**
    -   [ ] Create `e2e/pages/LocationsPage.ts` POM
    -   [ ] Create `e2e/locations.spec.ts`
    -   [ ] Test navigation to Locations page
    -   **CRUD Operations:**
        -   [ ] Test creating a location
        -   [ ] Test viewing location details
        -   [ ] Test editing a location
        -   [ ] Test deleting a location
    -   **Integration:**
        -   [ ] Test linking locations to map markers
    -   **Interactions:**
        -   [ ] Test filtering/searching locations

---

### 6. Combats (`combats.spec.ts`, `CombatsPage.ts`)

-   **Needed Tests:**
    -   [ ] Create `e2e/pages/CombatsPage.ts` POM
    -   [ ] Create `e2e/combats.spec.ts`
    -   [ ] Test navigation to Combats page
    -   **Combat Flow:**
        -   [ ] Test starting a combat
        -   [ ] Test adding participants
        -   [ ] Test initiative + turn order
        -   [ ] Test advancing turns/rounds
        -   [ ] Test applying damage/healing
        -   [ ] Test applying conditions
        -   [ ] Test removing participants
        -   [ ] Test ending combat

---

### 7. Assets (`assets.spec.ts`)

-   **Needed Tests:**
    -   [ ] Create `e2e/assets.spec.ts`
    -   [ ] Create/Modify relevant POMs for asset interactions
    -   [ ] Test uploading assets (images, PDFs)
    -   [ ] Test viewing images
    -   [ ] Test viewing PDFs
    -   [ ] Test deleting assets

---

### 8. Audio (`audio.spec.ts`)

-   **Needed Tests:**
    -   [ ] Create `e2e/audio.spec.ts`
    -   [ ] Create/Modify relevant POMs for audio interactions
    -   [ ] Test adding/selecting audio tracks
    -   [ ] Test playback controls (play, pause, stop)
    -   [ ] Test volume control
    -   [ ] Verify control states

---

### 9. Component-Level Tests (Implicit)

-   **Status:** To be covered by feature tests.

---

### 10. Responsiveness

-   **Needed Tests:**
    -   [ ] Configure viewports in `playwright.config.ts`
    -   [ ] Add tests verifying layout adjustments

---

### 11. Authentication/Authorization (If Applicable)

-   **Needed Tests (If Auth Exists):**
    -   [ ] Test login flow
    -   [ ] Test logout flow
    -   [ ] Test protected routes
    -   [ ] Test role-based access

---

*Update this file as tests are implemented.* 