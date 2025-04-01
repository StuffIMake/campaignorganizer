# Test Coverage Improvement Plan

**Goal:** Systematically increase test coverage across the Pen & Paper Project codebase to improve reliability, prevent regressions, and increase confidence during future development and refactoring.

**Reference:** This plan complements the existing [Testing Guide](./testing-guide.md), which outlines the core philosophy, tools (Jest, React Testing Library), and general best practices.

## Prioritization Strategy

We will prioritize testing based on the following criteria:

1.  **Feature Areas:** Focus on testing complete features, ensuring components, hooks, and state slices work together correctly.
2.  **Complexity:** Prioritize testing complex logic within hooks, state slices, and components with significant user interaction.
3.  **Criticality:** Ensure core user flows and essential components (like navigation, data display, forms) are well-tested.
4.  **Recent Changes:** Pay special attention to areas recently refactored (e.g., Combat, Store Slices) to verify their new implementations.
5.  **Existing Gaps:** Identify components, hooks, and slices currently lacking any tests.

## Testing Targets & Strategies

This section lists specific targets for testing, categorized by feature or area.

### 1. Combats Feature (`src/features/combats/`)

*   **`combatsSlice.ts` (Store Slice):**
    *   **Type:** Unit Tests
    *   **Needed:** Verify initial state, test reducers/actions (`fetchCombats`, `addCombat`, `updateCombat`, `deleteCombat`).
    *   **Strategy:** Mock `AssetManager.getDataObject` and `AssetManager.saveDataObject`. Test state changes based on dispatched actions.
*   **`useCombatSession` (Hook):**
    *   **Type:** Unit Tests
    *   **Needed:** Verify initial state, test participant management (add, remove, update HP/notes), turn progression (`nextTurn`), initiative sorting, participant selection.
    *   **Strategy:** Use `renderHook` from RTL. Mock store dependencies (`useStore`) to provide characters/combats if needed. Use `act()` to wrap state updates triggered by hook functions. Mock audio functions (`playTrack`, `stopIndividualTrack`).
*   **`ActiveCombatView.tsx` (View):**
    *   **Type:** Integration Test
    *   **Needed:** Verify rendering based on `useCombatSession` state (round, current participant), test interactions (clicking "Next Turn", opening "Add Participant" dialog).
    *   **Strategy:** Mock the `useCombatSession` hook to control its return value and assert component rendering. Mock the `useParams` or props providing the `combatId`. Mock child components (`CombatParticipantList`, `CombatParticipantDetails`, `AddParticipantDialog`) if focusing solely on the view's orchestration logic, or perform full integration tests including children.
*   **`CombatParticipantList.tsx` (Component):**
    *   **Type:** Integration Test
    *   **Needed:** Verify rendering of participant list items based on props, test clicking on a participant to select them (verify callback is called).
    *   **Strategy:** Provide mock participant data as props. Use `screen.getByText`, `screen.getAllByRole`. Simulate clicks with `fireEvent`.
*   **`CombatParticipantDetails.tsx` (Component):**
    *   **Type:** Integration Test
    *   **Needed:** Verify displaying details of the selected participant (props), test interactions like editing HP or notes (if applicable, verify callbacks).
    *   **Strategy:** Provide mock participant data. Check for rendered elements and values. Simulate interactions.
*   **`AddParticipantDialog.tsx` (Component):**
    *   **Type:** Integration Test
    *   **Needed:** Verify dialog opening/closing, character search/selection, initiative input, form submission (verify callback with correct data).
    *   **Strategy:** Mock `useStore` to provide character list. Simulate user input (`fireEvent.change`), selection, and button clicks.

### 2. Locations Feature (`src/features/locations/`)

*   **`locationsSlice.ts` (Store Slice):**
    *   **Type:** Unit Tests (*Review existing*)
    *   **Needed:** Verify CRUD actions (`addLocation`, `updateLocation`, `deleteLocation`, `fetchLocations`). Test selectors/getters (`getAllTopLevelLocations`, `getSublocationsByParentId`).
    *   **Strategy:** Similar to `combatsSlice`, mock `AssetManager`. Check state immutability.
*   **`useLocations` / `useLocationForm` (Hooks):**
    *   **Type:** Unit Tests
    *   **Needed:** Test state management, data fetching/filtering logic (`useLocations`), form validation/submission (`useLocationForm`).
    *   **Strategy:** Use `renderHook`, mock `useStore` dependencies.
*   **`LocationsView.tsx` (View):**
    *   **Type:** Integration Test
    *   **Needed:** Verify rendering list/map view, search interactions, opening add/edit dialogs.
    *   **Strategy:** Mock `useStore` and relevant hooks (`useLocations`). Test rendering based on mocked state. Simulate user interactions.
*   **Components (`LocationItem`, `LocationSearch`, `LocationFormDialog`, etc.):**
    *   **Type:** Integration Tests
    *   **Needed:** Test rendering based on props, user interactions (clicks, form inputs, search).
    *   **Strategy:** Provide mock props/data. Use RTL queries and `fireEvent`. Mock callbacks.

### 3. Characters Feature (`src/features/characters/`)

*   **`charactersSlice.ts` (Store Slice):**
    *   **Type:** Unit Tests
    *   **Needed:** Verify CRUD for characters and inventory items (`addCharacter`, `updateCharacter`, `deleteCharacter`, `addItemToCharacter`, etc.), `fetchCharacters`.
    *   **Strategy:** Mock `AssetManager`. Test state updates thoroughly, especially nested inventory changes.
*   **Hooks (`useCharacters`, `useCharacterForm`, `useItemForm`):**
    *   **Type:** Unit Tests
    *   **Needed:** Test state, form logic, validation.
    *   **Strategy:** `renderHook`, mock `useStore`.
*   **`CharactersView.tsx` (View):**
    *   **Type:** Integration Test
    *   **Needed:** Test rendering character cards, search functionality, opening dialogs.
    *   **Strategy:** Mock `useStore` and hooks.
*   **Components (`CharacterCard`, `CharacterFormDialog`, `ItemFormDialog`, etc.):**
    *   **Type:** Integration Tests
    *   **Needed:** Test rendering, form interactions, display logic.
    *   **Strategy:** Mock props, use RTL queries/events.

### 4. Map Feature (`src/features/map/`)

*   **`mapSlice.ts` (Store Slice):**
    *   **Type:** Unit Tests
    *   **Needed:** Test actions (`setSelectedLocationId`, `setCurrentLocationById`, `updateMapConfig`), initial state.
    *   **Strategy:** Test state changes. For `setCurrentLocationById`, mock the `get().locations` part if needed in isolation, or ensure mock store setup includes locations.
*   **Hooks (`useMap`, `useMapInteractions`, `useEntityDialogs`):**
    *   **Type:** Unit Tests
    *   **Needed:** Test map state handling, interaction logic (clicks, drags), dialog state management.
    *   **Strategy:** `renderHook`, mock `useStore` and potentially map libraries if used directly.
*   **`MapView.tsx` (View):**
    *   **Type:** Integration Test
    *   **Needed:** Verify rendering of map, sidebar, controls based on state. Test interactions passed to hooks/components. *Note: Testing map library interactions directly can be complex and might require specific mocking strategies or end-to-end tests.*
    *   **Strategy:** Mock `useStore` and hooks. Focus on checking if the correct props are passed to map components and if callbacks are triggered.
*   **Components (`LocationMap`, `LocationSidebar`, `MapControls`):**
    *   **Type:** Integration Tests
    *   **Needed:** Test rendering based on props, user interactions with controls/sidebar.
    *   **Strategy:** Mock props, use RTL queries/events.

### 5. Assets Feature (`src/features/assets/`)

*   **`assetsSlice.ts` (Store Slice):**
    *   **Type:** Unit Tests
    *   **Needed:** Test asset management actions (`refreshAssets`, `addAsset`, `deleteAsset`, etc.).
    *   **Strategy:** Mock `AssetManager`.
*   **Hooks (`useAssetManager`, `useJsonEditor`):**
    *   **Type:** Unit Tests
    *   **Needed:** Test IndexedDB interaction logic (mocked), JSON editing state.
    *   **Strategy:** `renderHook`, mock `useStore`, mock `AssetManager`.
*   **`AssetsView.tsx` (View):**
    *   **Type:** Integration Test
    *   **Needed:** Test rendering asset lists, dropzone.
    *   **Strategy:** Mock `useStore` and hooks.
*   **Components (`AssetDropZone`, `AssetList`, `JsonEditor`, etc.):**
    *   **Type:** Integration Tests
    *   **Needed:** Test file drop simulation (`AssetDropZone`), list rendering, editor interactions.
    *   **Strategy:** Mock props/store. Simulate file events for dropzone. Use RTL queries/events.

### 6. Audio Feature (`src/features/audio/`)

*   **`audioSlice.ts` (Store Slice):**
    *   **Type:** Unit Tests (*Review existing*)
    *   **Needed:** Verify actions for track management (add, remove, update state like volume/mute/loop), master volume.
    *   **Strategy:** Mock `Howler` instances and global `Howler` methods (`volume`). Test state transitions.
*   **`useAudioPlayer` (Hook):**
    *   **Type:** Unit Tests (*Review existing*)
    *   **Needed:** Test hook functions (`play`, `stop`, `toggleMute`, `adjustTrackVolume`, etc.) and their effect on the mocked store state / Howler mocks.
    *   **Strategy:** `renderHook`, mock `useStore`, mock `Howler`.
*   **Components (`AudioTrackPanel`, `AudioTrackSelector`):**
    *   **Type:** Integration Tests (*Review existing*)
    *   **Needed:** Verify rendering based on hook/store state, test user interactions (clicking buttons, adjusting sliders, selecting tracks).
    *   **Strategy:** Mock `useAudioPlayer` or `useStore`. Simulate user events.

### 7. Core Components & Utils

*   **`Navigation.tsx` (Component):**
    *   **Type:** Integration Test
    *   **Needed:** Verify rendering links, active link styling based on route.
    *   **Strategy:** Mock router context (e.g., wrap with `MemoryRouter` from `react-router-dom`).
*   **`AppLoader.tsx` / `StoreInitializer.tsx`:**
    *   **Type:** Integration Test
    *   **Needed:** Basic rendering test. For `StoreInitializer`, verify `initializeStore` is called (mock `useStore`).
*   **`src/utils/`:**
    *   **Type:** Unit Tests
    *   **Needed:** Test any formatting, calculation, or helper functions.
    *   **Strategy:** Standard Jest unit tests (`expect(utilFunction(input)).toBe(output)`).
*   **`src/services/assetManager.ts`:**
    *   **Type:** Unit Tests (*Lower Priority*)
    *   **Needed:** Test interactions with IndexedDB (CRUD operations).
    *   **Strategy:** Mock IndexedDB APIs (`indexedDB`, `IDBDatabase`, etc.) or use an in-memory mock library if available. This can be complex. Focus on testing components/slices that *use* `AssetManager` first by mocking the service itself.

## Execution Strategy

1.  **Setup:** Ensure testing environment is configured correctly (`jest.config.js`, necessary mocks).
2.  **Start by Feature:** Pick a feature (e.g., Combats).
3.  **Slice/Hook First:** Write unit tests for the store slice and any custom hooks within that feature. This ensures the core logic is sound.
4.  **Component Tests:** Write integration tests for the components within the feature, mocking the already-tested hooks/slices.
5.  **View Tests:** Write integration tests for the main feature view, ensuring it orchestrates the components correctly.
6.  **Iterate:** Move to the next feature.
7.  **Track Progress:** Update `docs/TESTING_PROGRESS.md` as tests are added.