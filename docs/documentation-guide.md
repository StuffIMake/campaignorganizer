# Documentation Guide

This guide outlines the standards for documentation in the Pen & Paper Project codebase. Following these standards helps maintain consistency and improves code maintainability.

## JSDoc Standards

We use JSDoc for documenting our code. Follow these guidelines:

### Files

Each file should have a file-level JSDoc comment at the top:

```typescript
/**
 * @file filename.ts
 * @description Brief description of what this file contains and its purpose
 */
```

### Components

React components should be documented with:

```typescript
/**
 * ComponentName component
 * 
 * Detailed description of what the component does, its purpose, and any special behaviors.
 * 
 * @param {ComponentProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
```

### Hooks

Custom hooks should be documented with:

```typescript
/**
 * Custom hook that provides specific functionality
 * 
 * Detailed description of what the hook does, what state it manages,
 * and what functions it provides.
 * 
 * @param {HookParams} params - Parameters for the hook
 * @returns {Object} Hook state and functions
 */
```

### Props and Interfaces

Props interfaces should be documented with:

```typescript
/**
 * Props for the ComponentName component
 */
interface ComponentProps {
  /** Description of prop1 */
  prop1: type;
  
  /** Description of prop2 */
  prop2: type;
}
```

### Functions

Functions should be documented with:

```typescript
/**
 * Brief description of what the function does
 * 
 * @param {Type} param1 - Description of parameter
 * @param {Type} param2 - Description of parameter
 * @returns {ReturnType} Description of return value
 */
```

### Types and Interfaces

Types and interfaces should be documented with:

```typescript
/**
 * Description of what this type/interface represents
 */
export interface ExampleType {
  /** Description of property */
  property1: string;
  
  /** Description of property */
  property2: number;
}
```

## Best Practices

1. **Be concise but comprehensive** - Explain what the code does without repeating the obvious.
2. **Document edge cases** - Mention any special handling or edge cases the code addresses.
3. **Explain the "why"** - Code shows what is done, documentation should explain why.
4. **Keep documentation up to date** - Update documentation when you change code functionality.
5. **Use consistent terminology** - Use the same terms throughout the documentation.

## Examples

Look at the following files for examples of well-documented code:

- `src/features/map/hooks/useMap.ts`
- `src/features/locations/components/LocationSearch.tsx`
- `src/types/location.ts` 