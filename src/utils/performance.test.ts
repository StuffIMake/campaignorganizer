import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useRenderTracker } from './performance';
import { jest } from '@jest/globals';

describe('Performance utilities', () => {
  // Mock console.log to prevent test output pollution
  const originalConsoleLog = console.log;
  beforeEach(() => {
    console.log = jest.fn();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
  });
  
  describe('useRenderTracker', () => {
    it('should log component name and render count', () => {
      renderHook(() => useRenderTracker('TestComponent'));
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Render] TestComponent rendered 1 times')
      );
    });
    
    it('should log props when provided', () => {
      const testProps = { id: 1, name: 'test' };
      renderHook(() => useRenderTracker('TestComponent', testProps));
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Props] TestComponent:'),
        testProps
      );
    });
  });
}); 