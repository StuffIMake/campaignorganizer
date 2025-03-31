import { create } from 'zustand';
import { Howl } from 'howler';
import { AssetManager } from '../services/assetManager';
import { createLocationsSlice, LocationsState } from '../features/locations/store';
import { createCharactersSlice, CharactersState } from '../features/characters/store';
import { createAssetsSlice, AssetsState } from '../features/assets/store';
import { createCombatsSlice, CombatsSlice } from './slices/combatsSlice';
import { createAudioSlice, AudioState } from '../features/audio/store/audioSlice';

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

// Export the current item type definitions
// These interfaces will be moved to types directory in a future refactor
export interface CustomLocation {
  id: string;
  name: string;
  description: string;
  backgroundMusic?: string;
  entrySound?: string;
  imageUrl?: string;
  descriptionType?: 'markdown' | 'image' | 'pdf';
  mixWithParent?: boolean;
  coordinates?: [number, number];
  inventory?: Item[];
  sublocations?: CustomLocation[];
  parentLocationId?: string;
  connectedLocations?: string[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  type: 'npc' | 'merchant' | 'enemy' | 'player';
  descriptionType?: 'markdown' | 'image' | 'pdf';
  descriptionAssetName?: string;  // Reference to an image/pdf in assets
  hp: number;  // Hit Points
  inventory?: Item[];
  locationId?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price?: number;
}

export interface Combat {
  id: string;
  name: string;
  description: string;      // Can be markdown text
  descriptionType: 'markdown' | 'image' | 'pdf';
  descriptionAssetName?: string;  // Reference to an image/pdf in assets
  playerCharacters: Character[];
  enemies: Character[];
  entrySound?: string;      // Reference to audio asset
  backgroundMusic?: string; // Reference to audio asset
  backgroundImage?: string; // Reference to image asset
  difficulty?: 'easy' | 'medium' | 'hard' | 'custom';
  rewards?: Item[];
  locationId?: string;      // Location where this combat takes place
}

// For type compatibility, we're using base types for our slices
// and then combining them into our store state
type BaseState = Omit<
  LocationsState & CharactersState & AssetsState & CombatsSlice,
  keyof AudioState
>;

// Define a new type that omits conflicting methods from AudioState
type AudioStateWithoutConflicts = Omit<AudioState, 'stopTrack'> & {
  // Define the stopAllTracks method from AudioState as our legacy stopTrack
  stopTrack: () => void;
  // Add the stopIndividualTrack method for backward compatibility
  stopIndividualTrack: (trackId: string) => void;
}

// Combine our store state
interface StoreState extends BaseState, AudioStateWithoutConflicts {
  // Other state not yet moved to slices
  mapConfig: {
    worldWidth: number;
    worldHeight: number;
  };
  selectedLocationId: string | null;
  currentLocation?: CustomLocation;
  setCurrentLocation: (locationId: string) => void;
  setSelectedLocationId: (locationId: string | null) => void;
  initializeStore: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  (set, get, api) => {
  // First get the audio slice
  const audioSlice = createAudioSlice(
    set as any, 
    get as any, 
    api
  );
  
  // Create our combined store
  return {
    // Include the feature slices
    ...createLocationsSlice(set, get, api),
    ...createCharactersSlice(set, get, api),
    ...createAssetsSlice(set, get, api),
    ...createCombatsSlice(set, get, api),
    
    // Add the audio slice with renamed methods to avoid conflicts
    ...audioSlice,
    // Override stopTrack to use the old behavior (stop all tracks)
    stopTrack: audioSlice.stopAllTracks,
    // Add stopIndividualTrack to match our hook's expectation
    stopIndividualTrack: audioSlice.stopTrack,
    
    // Initialize remaining state
    mapConfig: {
      worldWidth: 1920,
      worldHeight: 1080,
    },
    selectedLocationId: null,
    currentLocation: undefined,
    
    // Add remaining methods that haven't been moved to slices yet
    setCurrentLocation: (locationId) => {
      const location = get().locations.find((loc) => loc.id === locationId);
      set({ currentLocation: location });
    },
  
    setSelectedLocationId: (locationId) => {
      set({ selectedLocationId: locationId });
    },
    
    // Initialize assets asynchronously
    initializeStore: async () => {
      try {
        set({ isLoading: true });
        
        // Use the refreshAssets method from the assets slice
        await get().refreshAssets();
        
        const { hasAssets } = get();
        
        if (hasAssets) {
          // Load locations and characters from IndexedDB
          const locations = await getLocationsData();
          const characters = await getCharactersData();
          
          // Use fetchCombats from the combats slice
          await get().fetchCombats();
          
          set({ 
            locations, 
            characters,
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Error initializing store:', error);
        set({ isLoading: false });
      }
    }
  };
}); 