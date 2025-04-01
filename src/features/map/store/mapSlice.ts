/**
 * @file mapSlice.ts
 * @description Map feature store slice for managing map state
 */

import { StateCreator } from 'zustand';
import { BaseState } from '../../../types/index';
import { CustomLocation, MapConfig } from '../../../types/location';
import type { FullStoreState } from '../../../store/index'; // Import the full store state type

/**
 * Map slice state interface
 */
export interface MapState extends BaseState {
  /** Map configuration settings */
  mapConfig: MapConfig;
  
  /** ID of currently selected location */
  selectedLocationId: string | null;
  
  /** Current active location */
  currentLocation?: CustomLocation;
}

/**
 * Map slice actions interface
 */
export interface MapActions {
  /** Set the currently selected location ID */
  setSelectedLocationId: (locationId: string | null) => void;
  
  /** Set the current active location based on ID */
  setCurrentLocationById: (locationId: string) => void;
  
  /** Update map configuration */
  updateMapConfig: (config: Partial<MapConfig>) => void;
}

/** Combined map slice type */
export type MapSlice = MapState & MapActions;

/**
 * Creates the map slice for the store
 */
export const createMapSlice: StateCreator<
  FullStoreState, // Use the full store state
  [], 
  [], 
  MapSlice // Return type is still just the map slice
> = (set, get) => ({
  // Initial state for the map slice
  mapConfig: {
    worldWidth: 1920,
    worldHeight: 1080
  },
  selectedLocationId: null,
  currentLocation: undefined,
  isLoading: false, // Initialize BaseState properties
  error: null,
  
  // Actions specific to the map slice
  setSelectedLocationId: (locationId) => {
    set({ selectedLocationId: locationId } as Partial<MapSlice>);
  },
  
  // Renamed to avoid conflict and use full state access
  setCurrentLocationById: (locationId) => {
    const locations = get().locations; // Access locations from locationsSlice via FullStoreState
    const location = locations?.find((loc: CustomLocation) => loc.id === locationId);
    set({ currentLocation: location } as Partial<MapSlice>);
  },
  
  updateMapConfig: (config) => {
    set((state) => ({
      mapConfig: {
        ...state.mapConfig,
        ...config
      }
    } as Partial<MapSlice>));
  }
}); 