import { useEffect } from 'react';
import { useStore } from '../store';

/**
 * Component that initializes the store when the app is loaded
 * This ensures data is fetched from IndexedDB properly
 */
export const StoreInitializer = () => {
  const initializeStore = useStore(state => state.initializeStore);

  useEffect(() => {
    // Initialize the store when the component mounts
    initializeStore();
  }, [initializeStore]);

  return null;
}; 