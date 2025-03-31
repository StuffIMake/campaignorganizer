# Testing Guide

This guide outlines the approach to testing in the Pen & Paper Project codebase. Following these standards helps maintain code quality and prevents regressions.

## Testing Philosophy

We focus on testing behavior rather than implementation details. This means we test what the component or function does, not how it does it. This approach leads to more maintainable tests that don't break when refactoring.

## Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API calls

## Types of Tests

### Unit Tests

Unit tests focus on testing individual functions, hooks, or small components in isolation.

```typescript
// Example: Testing a utility function
describe('formatDate', () => {
  it('formats a date in the expected format', () => {
    const date = new Date('2023-01-01');
    expect(formatDate(date)).toBe('Jan 1, 2023');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

### Integration Tests

Integration tests verify that multiple units work together correctly.

```typescript
// Example: Testing a component with its hooks
describe('LocationCard', () => {
  it('displays location details correctly', () => {
    const location = {
      id: '123',
      name: 'Test Location',
      description: 'Test description'
    };
    
    render(<LocationCard location={location} />);
    
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = jest.fn();
    const location = { id: '123', name: 'Test Location' };
    
    render(<LocationCard location={location} onSelect={handleSelect} />);
    
    fireEvent.click(screen.getByText('Test Location'));
    expect(handleSelect).toHaveBeenCalledWith('123');
  });
});
```

## Testing Custom Hooks

We test custom hooks using React Testing Library's `renderHook` function:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with the provided initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('increments the counter', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });
});
```

## Test File Structure

- Test files should be co-located with the code they're testing
- Use the `.test.ts` or `.test.tsx` extension
- Mirror the structure of the source code in the test file

```
src/
  features/
    locations/
      components/
        LocationCard.tsx
        LocationCard.test.tsx
      hooks/
        useLocations.ts
        useLocations.test.ts
```

## Mocking Dependencies

Use Jest's mocking capabilities to mock dependencies:

```typescript
// Mock the store
jest.mock('../../../store', () => ({
  useStore: jest.fn(() => ({
    locations: [...mockLocations],
    addLocation: jest.fn(),
    updateLocation: jest.fn()
  }))
}));
```

## Best Practices

1. **Test behavior, not implementation** - Focus on the user's perspective.
2. **Keep tests simple** - Tests should be easy to read and understand.
3. **Use meaningful assertions** - Assertions should clearly indicate what's being tested.
4. **Don't test third-party code** - Focus on testing your own code.
5. **Use descriptive test names** - Test names should describe the behavior being tested.

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Example Test Implementations

Look at the following files for examples of well-written tests:

- `src/utils/formatters.test.ts`
- `src/features/locations/hooks/useLocations.test.ts`
- `src/features/locations/components/LocationCard.test.tsx` 