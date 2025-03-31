import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CustomLocation } from '../../../store';

export interface LocationsState {
  locations: CustomLocation[];
  addLocation: (location: Omit<CustomLocation, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<CustomLocation>) => void;
  deleteLocation: (id: string) => void;
  getAllTopLevelLocations: () => CustomLocation[];
  getSublocationsByParentId: (parentId: string) => CustomLocation[];
}

export const createLocationsSlice: StateCreator<
  LocationsState,
  [],
  [],
  LocationsState
> = (set, get) => ({
  locations: [],
  
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
  }
}); 