import { create } from 'zustand';
import { Howl } from 'howler';
import { AssetManager } from '../services/assetManager';
import { createLocationsSlice, LocationsState } from '../features/locations/store';
import { createCharactersSlice, CharactersState } from '../features/characters/store';
import { createAssetsSlice, AssetsState } from '../features/assets/store';
import { createCombatsSlice, CombatsSlice } from './slices/combatsSlice';
import { createAudioSlice, AudioState } from '../features/audio/store/audioSlice';
import { createMapSlice, MapSlice } from '../features/map/store';
import { CustomLocation, Location, MapConfig } from '../types/location';
import { Character, Item } from '../types/character';
import { Combat } from '../types/combat';

// Remove the problematic export that's causing the module error
// export * from '../types';

// Get data from IndexedDB asynchronously, with empty arrays as fallbacks
const getLocationsData = async () => {
  const customLocations = await AssetManager.getDataObject("locations.json") as CustomLocation[];
  return customLocations || [];
};

const getCharactersData = async () => {
  const customCharacters = await AssetManager.getDataObject("characters.json") as Character[];
  return customCharacters || [];
};

// Export the types from the types directory for backward compatibility
export type { CustomLocation, Character, Item, Combat };

// Combine all slice types for the complete store state definition
// Note: We use the individual slice types here for clarity and maintainability
export type FullStoreState = LocationsState & 
                             CharactersState & 
                             AssetsState & 
                             CombatsSlice & 
                             MapSlice & 
                             AudioState & {
  // Add any methods or properties that genuinely need to be at the root
  initializeStore: () => Promise<void>;
};

// Define the actual store state type used by Zustand create
// This uses the FullStoreState to ensure all slices are included
interface StoreState extends FullStoreState {}

export const useStore = create<StoreState>()(
  (set, get, api) => {
  
  // Create our combined store
  return {
    // Include the feature slices
    ...createLocationsSlice(set, get, api),
    ...createCharactersSlice(set, get, api),
    ...createAssetsSlice(set, get, api),
    ...createCombatsSlice(set, get, api),
    ...createMapSlice(set, get, api),
    ...createAudioSlice(set, get, api),
    
    // Initialize assets asynchronously
    initializeStore: async () => {
      try {
        set({ isLoading: true }); // Maybe set loading state on relevant slices?
        
        // Use the refreshAssets method from the assets slice
        await get().refreshAssets();
        
        const { hasAssets } = get();
        
        if (hasAssets) {
          // Call fetch methods on the respective slices
          await Promise.all([
            get().fetchLocations(),
            get().fetchCharacters(),
            get().fetchCombats()
          ]);
        }
        
        set({ isLoading: false }); // Reset loading state

      } catch (error) {
        console.error('Error initializing store:', error);
        // Consider setting error state on relevant slices
        set({ isLoading: false }); 
      }
    }
  };
}); 