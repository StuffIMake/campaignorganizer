# Refactoring Next Steps

This document outlines the next set of tasks to continue improving the Pen & Paper Project codebase, following the initial refactoring efforts documented in `docs/refactoring-progress.md`.

## Immediate Priorities - Completed! ✅

These items have been addressed based on the latest code review:

1.  ~~**Refactor `ActiveCombatView.tsx`**~~ (Moved, decomposed, logic extracted)
2.  ~~**Move Type Definitions from Store**~~ (Types centralized in `src/types/`)
3.  ~~**Refactor Remaining Global Store Logic**~~ (State moved to `mapSlice`)

## Ongoing Enhancements

These items focus on continuous improvement and completing the refactoring vision:

1.  **Expand Test Coverage:**
    *   **Goal:** Increase confidence in code stability and prevent regressions.
    *   **Actions:**
        *   Continue writing unit and integration tests for newly created/refactored hooks and components within each feature directory (following `docs/testing-guide.md`).
        *   Focus on testing critical user flows and complex logic.
        *   Implement mocking strategies (e.g., for the store or services) where necessary for isolated testing.

2.  **Performance Optimization:**
    *   **Goal:** Ensure the application remains responsive, especially with growing data.
    *   **Actions:**
        *   Profile application performance using browser dev tools or React DevTools.
        *   Apply `React.memo` to components that re-render unnecessarily.
        *   Use memoized selectors (e.g., with `reselect` if using Redux Toolkit, or custom memoization with Zustand) when deriving data from the store to prevent unnecessary recalculations/re-renders.
        *   Consider implementing virtualized lists (e.g., using `react-window` or `react-virtualized`) for potentially long lists (locations, characters, assets, combat participants).

3.  **Complete Documentation Coverage:**
    *   **Goal:** Ensure the codebase is easy to understand and maintain.
    *   **Actions:**
        *   Add JSDoc comments to remaining undocumented functions, hooks, components, and types (following `docs/documentation-guide.md`).
        *   Create/update `README.md` files within each `src/features/*` directory explaining the feature's purpose and structure.
        *   Add inline comments for particularly complex or non-obvious logic sections.

4.  **Review Asset Management:**
    *   **Goal:** Ensure asset handling is consistent and efficient.
    *   **Actions:**
        *   Analyze the usage of the standalone `src/services/assetManager.ts`.
        *   Evaluate if its responsibilities can/should be fully integrated into the `assetsSlice` and `useAssetManager` hook within `src/features/assets/`.
        *   Refactor components currently importing directly from `assetManager.ts` (like `AudioTrackSelector`) to use the store slice or hook instead, if appropriate.

5.  **UI Component Consistency:**
    *   **Goal:** Ensure a consistent approach to UI components.
    *   **Actions:**
        *   Review the usage of base UI components (from `src/components/ui/`), Headless UI components (like `Combobox` seen in `ActiveCombatView`), and custom Tailwind CSS styles.
        *   Ensure consistency in how components are built and styled across different features.
        *   Refactor any inconsistencies found.