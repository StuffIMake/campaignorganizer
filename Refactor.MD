# Project Refactoring Plan

**Goal:** Restructure, optimize, and streamline the Pen & Paper Project codebase for improved maintainability, performance, and developer experience.

**Methodology:** This plan is divided into phases. Each phase contains specific action items targeting different areas of the codebase. Execution should ideally follow the phased approach, although some tasks might be parallelizable.

---

## Phase 1: Analysis & Initial Cleanup

**Objective:** Understand the current codebase state, identify major pain points (especially large files and complex logic), and perform initial cleanup.

**Action Items:**

1.  **Analyze Large Page Components:**
    *   **Goal:** Understand the responsibilities and complexity of oversized page components.
    *   **Targets:**
        *   `src/pages/LocationsView.tsx` (73KB)
        *   `src/pages/CombatsView.tsx` (48KB)
        *   `src/pages/MapView.tsx` (24KB)
        *   `src/pages/CharactersView.tsx` (22KB)
    *   **Actions:**
        *   Read and analyze the code within these files.
        *   Identify distinct logical sections (e.g., data fetching, state updates, UI rendering, specific feature logic).
        *   Document findings (e.g., component responsibilities, potential areas for extraction).
    *   **Rationale:** Large components are hard to maintain, test, and understand. Breaking them down improves modularity.
    *   **Data Needed:** Contents of the target files.

2.  **Review State Management:**
    *   **Goal:** Assess the structure and efficiency of the state management implementation.
    *   **Targets:**
        *   `src/store/index.ts` (21KB)
        *   `src/store/types.ts` (1.1KB)
    *   **Actions:**
        *   Analyze the main store file (`index.ts`) to understand how state is organized (slices, reducers/actions).
        *   Identify if the store is monolithic or modular.
        *   Look for opportunities to split the store by feature.
        *   Check for unused state slices or actions.
        *   Review type definitions (`types.ts`) for clarity and completeness.
    *   **Rationale:** A well-structured store improves state predictability and maintainability. Feature-based splitting reduces coupling.
    *   **Data Needed:** Contents of `src/store/index.ts`.

3.  **Analyze Large Core Components:**
    *   **Goal:** Understand the responsibilities and complexity of oversized core components.
    *   **Targets:**
        *   `src/components/AssetDropZone.tsx` (29KB)
        *   `src/components/ActiveCombatView.tsx` (24KB)
        *   `src/components/map/EditLocationDialog.tsx` (16KB)
        *   `src/components/map/LocationDetails.tsx` (15KB)
        *   `src/components/Navigation.tsx` (13KB)
    *   **Actions:**
        *   Read and analyze the code within these files.
        *   Identify single responsibilities and areas where components handle too much logic.
        *   Determine if logic can be extracted into hooks or smaller sub-components.
    *   **Rationale:** Similar to pages, large components hinder maintainability. Decomposition is key.
    *   **Data Needed:** Contents of the target files.

4.  **Investigate Asset Management Service:**
    *   **Goal:** Understand the role and complexity of the asset management service.
    *   **Target:** `src/services/assetManager.ts` (24KB)
    *   **Actions:**
        *   Analyze the service's functions and responsibilities.
        *   Determine if it can be simplified, broken down by asset type, or optimized.
    *   **Rationale:** Ensure service layers are focused and efficient.
    *   **Data Needed:** Contents of `src/services/assetManager.ts`.

5.  **Dependency Audit:**
    *   **Goal:** Identify and potentially remove unused or outdated dependencies.
    *   **Target:** `package.json`
    *   **Actions:**
        *   Review the `dependencies` and `devDependencies` sections.
        *   Cross-reference with imports throughout the `src` directory to find unused packages.
        *   Check for outdated major versions and assess migration feasibility.
        *   Consider using tools like `depcheck`.
        *   Run `npm prune` or `yarn autoclean` after removals.
    *   **Rationale:** Reduces bundle size, speeds up installation, and minimizes security vulnerabilities.
    *   **Data Needed:** Contents of `package.json`.

---

## Phase 2: Restructuring & Optimization

**Objective:** Reorganize the codebase for better modularity (feature-based structure) and implement performance optimizations.

**Action Items:**

1.  **Implement Feature-Based Directory Structure:**
    *   **Goal:** Reorganize code from type-based (`pages`, `components`) to feature-based directories.
    *   **Targets:** `src/`, `src/pages/`, `src/components/`, `src/store/`, `src/services/`
    *   **Actions:**
        *   Create new top-level directories under `src/features/` (e.g., `src/features/combats`, `src/features/locations`, `src/features/map`, `src/features/characters`, `src/features/assets`).
        *   Move relevant components, views (pages), store slices, hooks, types, and potentially services into their corresponding feature directory.
        *   Keep genuinely shared/common elements in `src/components/ui`, `src/hooks`, `src/store/common`, `src/types`, `src/lib`, etc.
        *   Update all imports across the application to reflect the new structure.
    *   **Rationale:** Improves code colocation, making features easier to understand, develop, and maintain independently. Reduces coupling between features.

2.  **Refactor Page Components:**
    *   **Goal:** Slim down page components identified in Phase 1.
    *   **Targets:** Primarily files within `src/pages/` (or their new locations in `src/features/*/views/`).
    *   **Actions:**
        *   Extract data fetching logic into custom hooks (e.g., `useCombatData`, `useLocationData`) placed within the relevant feature's `hooks` directory or a shared `src/hooks` directory.
        *   Move complex UI sections into dedicated components within the feature's `components` directory or `src/components` if reusable.
        *   Ensure page components primarily orchestrate layout and data flow.
    *   **Rationale:** Adheres to the Single Responsibility Principle, improves testability and reusability of logic and UI.

3.  **Refactor Core Components:**
    *   **Goal:** Break down large components identified in Phase 1.
    *   **Targets:** Primarily files within `src/components/` (or their new locations).
    *   **Actions:**
        *   Decompose components into smaller, focused sub-components.
        *   Extract complex logic or state management into custom hooks.
        *   Utilize composition to build complex UIs from smaller blocks.
    *   **Rationale:** Enhances reusability, testability, and readability of components.

4.  **Modularize State Management:**
    *   **Goal:** Split the central store into feature-specific slices/modules.
    *   **Targets:** `src/store/index.ts` (and its new location/structure).
    *   **Actions:**
        *   Create separate state slices/reducers for each major feature (e.g., `combatsSlice.ts`, `locationsSlice.ts`) within their respective `src/features/*/store/` directories.
        *   Combine these slices in a root store configuration file.
        *   Update components to select state and dispatch actions from the relevant feature slices.
    *   **Rationale:** Reduces the size and complexity of the main store file, improves organization, and makes state logic easier to manage per feature.

5.  **Implement Code Splitting (Routing):**
    *   **Goal:** Load page/view components only when their route is active.
    *   **Target:** Routing configuration (likely in `App.tsx` or a dedicated routing file).
    *   **Actions:**
        *   Use `React.lazy()` to dynamically import page/view components.
        *   Wrap dynamic imports with `<React.Suspense>` providing a fallback UI (e.g., a loading spinner from `AppLoader.tsx`).
    *   **Rationale:** Reduces the initial bundle size, leading to faster initial page loads.

6.  **Optimize Component Rendering:**
    *   **Goal:** Prevent unnecessary component re-renders.
    *   **Targets:** Components identified as potentially causing performance issues (requires profiling or analysis).
    *   **Actions:**
        *   Wrap components that receive props and render complex trees with `React.memo()`.
        *   Ensure stable prop references (use `useCallback` for functions, `useMemo` for objects/arrays passed as props).
        *   Optimize context usage if it causes widespread re-renders.
    *   **Rationale:** Improves application responsiveness, especially in complex views.

7.  **Optimize Static Assets:**
    *   **Goal:** Ensure static assets (images, icons) are efficiently delivered.
    *   **Targets:** `src/assets/` directory, icon implementations (`src/assets/icons/index.tsx`).
    *   **Actions:**
        *   Compress images using appropriate tools and formats (e.g., WebP).
        *   Ensure SVGs used as icons are optimized (e.g., using SVGO).
        *   Review how icons are bundled – ensure tree-shaking is effective if using an icon library or large index file.
    *   **Rationale:** Reduces bandwidth usage and improves load times.

---

## Phase 3: Refinement & Documentation

**Objective:** Enhance long-term maintainability through type safety, consistency, testing, and documentation.

**Action Items:**

1.  **Enhance Type Safety:**
    *   **Goal:** Improve TypeScript coverage and specificity.
    *   **Targets:** Entire `src` directory, particularly `*.ts` and `*.tsx` files, `types.d.ts`.
    *   **Actions:**
        *   Replace `any` types with specific types where possible.
        *   Define clear interfaces and types for API responses, state slices, and component props.
        *   Centralize and reuse common types in `src/types` or feature-specific `types.ts` files.
    *   **Rationale:** Improves code reliability, catches errors during development, and enhances developer experience via autocompletion.

2.  **Enforce Code Style & Linting:**
    *   **Goal:** Ensure consistent code formatting and adherence to best practices.
    *   **Targets:** Entire codebase.
    *   **Actions:**
        *   Configure ESLint and Prettier with appropriate rules (e.g., Airbnb style guide, project-specific rules).
        *   Integrate linting and formatting into the development workflow (e.g., pre-commit hooks).
        *   Run linters/formatters across the entire codebase to fix inconsistencies.
    *   **Rationale:** Improves code readability and maintainability, reduces trivial merge conflicts.

3.  **Introduce/Expand Testing:**
    *   **Goal:** Add automated tests for critical application parts.
    *   **Targets:** Key components, utility functions, hooks, store logic, services.
    *   **Actions:**
        *   Set up a testing framework (e.g., Jest, Vitest) and testing library (e.g., React Testing Library).
        *   Write unit tests for pure functions, hooks, and reducers/slices.
        *   Write integration tests for components to verify interactions and rendering based on props/state.
        *   Prioritize testing complex logic and core features.
    *   **Rationale:** Prevents regressions, ensures code behaves as expected, and facilitates safer refactoring in the future.

4.  **Add Code Documentation:**
    *   **Goal:** Improve understanding of the codebase for current and future developers.
    *   **Targets:** Complex components, functions, types, feature directories.
    *   **Actions:**
        *   Add JSDoc comments to explain the purpose, parameters, and return values of complex functions and hooks.
        *   Add comments explaining non-obvious logic within functions or components.
        *   Create/update README.md files within feature directories (`src/features/*`) explaining the feature's purpose and structure.
    *   **Rationale:** Makes the codebase easier to navigate and understand, reducing onboarding time and debugging effort.

---

**Required Information for Execution:**

*   Contents of key large files identified in Phase 1 (e.g., `src/pages/LocationsView.tsx`, `src/pages/CombatsView.tsx`, `src/store/index.ts`, `src/components/AssetDropZone.tsx`, `src/services/assetManager.ts`).
*   Contents of `package.json`.
*   Details about the UI library (Tailwind 4) and build tool.
