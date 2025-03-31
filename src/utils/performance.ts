import React, { useRef, useEffect } from 'react';

/**
 * Hook to track component render count during development
 * @param componentName - Name of the component being monitored
 * @param props - The props object to check for changes
 */
export const useRenderTracker = (componentName: string, props?: any) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    // Logging will be stripped out in production builds via tree-shaking
    renderCount.current += 1;
    console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
    
    if (props) {
      console.log(`[Props] ${componentName}:`, props);
    }
  });
  
  return renderCount.current;
};

/**
 * HOC to wrap components with React.memo and provide a display name
 * @param Component - Component to wrap with memo
 * @param name - Optional name to use for the component
 */
export function withMemo<T>(
  Component: React.ComponentType<T>, 
  name?: string
): React.MemoExoticComponent<React.ComponentType<T>> {
  const MemoizedComponent = React.memo(Component);
  
  // Set display name for easier debugging
  if (name) {
    MemoizedComponent.displayName = `Memo(${name})`;
  } else if (Component.displayName) {
    MemoizedComponent.displayName = `Memo(${Component.displayName})`;
  } else if (Component.name) {
    MemoizedComponent.displayName = `Memo(${Component.name})`;
  }
  
  return MemoizedComponent;
}

/**
 * Utility to create a stable object reference with useMemo
 * @param obj - Object to memoize
 * @param deps - Dependency array for useMemo
 */
export function memoObject<T extends object>(obj: T, deps: React.DependencyList) {
  return React.useMemo(() => obj, deps);
}

/**
 * Create a stable callback with useCallback and proper typing
 * @param callback - Function to memoize
 * @param deps - Dependency array for useCallback
 */
export function memoCallback<T extends (...args: any[]) => any>(
  callback: T, 
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps);
} 