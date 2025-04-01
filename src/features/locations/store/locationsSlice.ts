import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CustomLocation } from '../../../store';
import { AssetManager } from '../../../services/assetManager';
import { BaseState } from '../../../types/index';

export interface LocationsState extends BaseState {
  locations: CustomLocation[];
  addLocation: (location: Omit<CustomLocation, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<CustomLocation>) => void;
  deleteLocation: (id: string) => void;
  getAllTopLevelLocations: () => CustomLocation[];
  getSublocationsByParentId: (parentId: string) => CustomLocation[];
  fetchLocations: () => Promise<void>;
}

export const createLocationsSlice: StateCreator<
  LocationsState,
  [],
  [],
  LocationsState
> = (set, get) => ({
  locations: [],
  isLoading: false,
  error: null,
  
  addLocation: (location) => {
    const newLocation: CustomLocation = {
      id: uuidv4(),
      ...location,
    };
    
    set((state) => ({
      locations: [...state.locations, newLocation]
    }));
  },
  
  updateLocation: (id, updates) => {
    set((state) => ({
      locations: state.locations.map(location => 
        location.id === id ? { ...location, ...updates } : location
      )
    }));
  },
  
  deleteLocation: (id) => {
    // First get all sublocations recursively
    const getAllChildIds = (parentId: string): string[] => {
      const directChildren = get().locations.filter(loc => loc.parentLocationId === parentId);
      const childIds = directChildren.map(child => child.id);
      
      // Get children of children recursively
      const subChildIds = directChildren.flatMap(child => getAllChildIds(child.id));
      
      return [...childIds, ...subChildIds];
    };
    
    const childIdsToDelete = getAllChildIds(id);
    const allIdsToDelete = [id, ...childIdsToDelete];
    
    set((state) => ({
      locations: state.locations.filter(location => !allIdsToDelete.includes(location.id))
    }));
  },
  
  getAllTopLevelLocations: () => {
    return get().locations.filter(location => !location.parentLocationId);
  },
  
  getSublocationsByParentId: (parentId) => {
    return get().locations.filter(location => location.parentLocationId === parentId);
  },
  
  fetchLocations: async () => {
    try {
      set({ isLoading: true, error: null } as Partial<LocationsState>);
      const locationsData = await AssetManager.getDataObject<CustomLocation[]>('locations.json');
      set({ 
        locations: locationsData || [],
        isLoading: false 
      } as Partial<LocationsState>);
    } catch (error) {
      set({ 
        error: `Failed to fetch locations: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false 
      } as Partial<LocationsState>);
    }
  }
}); 