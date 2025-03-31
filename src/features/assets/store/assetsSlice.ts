import { StateCreator } from 'zustand';
import { AssetManager } from '../../../services/assetManager';

export interface AssetEntry {
  name: string;
  data: string; // Base64 encoded data
  type: string; // MIME type
  lastModified: number;
}

export type AssetType = 'audio' | 'images' | 'data';

export interface AssetsState {
  audioAssets: string[];
  imageAssets: string[];
  dataAssets: string[];
  hasAssets: boolean;
  isLoading: boolean;
  refreshAssets: () => Promise<void>;
  saveDataToIndexedDB: () => Promise<{ success: boolean; message: string }>;
  exportToZip: () => Promise<{ success: boolean; message: string; url?: string }>;
}

export const createAssetsSlice: StateCreator<
  AssetsState,
  [],
  [],
  AssetsState
> = (set, get) => ({
  audioAssets: [],
  imageAssets: [],
  dataAssets: [],
  hasAssets: false,
  isLoading: false,
  
  refreshAssets: async () => {
    try {
      set({ isLoading: true });
      
      // Check if we have assets
      const hasAudio = await AssetManager.hasAssets('audio');
      const hasImages = await AssetManager.hasAssets('images');
      const hasData = await AssetManager.hasAssets('data');
      
      const hasAssets = hasAudio || hasImages || hasData;
      
      // Load asset lists
      const audioAssets = await AssetManager.getAssets('audio');
      const imageAssets = await AssetManager.getAssets('images');
      const dataAssets = await AssetManager.getAssets('data');
      
      set({ 
        hasAssets,
        audioAssets: audioAssets.map(asset => asset.name),
        imageAssets: imageAssets.map(asset => asset.name),
        dataAssets: dataAssets.map(asset => asset.name),
        isLoading: false 
      });
    } catch (error) {
      console.error('Error refreshing assets:', error);
      set({ isLoading: false });
    }
  },
  
  saveDataToIndexedDB: async () => {
    try {
      set({ isLoading: true });
      
      // Implement your save logic here or reuse from existing code
      const saveResult = { success: true, message: 'Data saved successfully' };
      
      // After saving, refresh assets
      await get().refreshAssets();
      
      set({ isLoading: false });
      return saveResult;
    } catch (error) {
      console.error('Error saving data:', error);
      set({ isLoading: false });
      return { 
        success: false, 
        message: `Error saving data: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  exportToZip: async () => {
    try {
      set({ isLoading: true });
      
      // Use AssetManager's exportToZip function
      const result = await AssetManager.exportToZip();
      
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Error exporting to ZIP:', error);
      set({ isLoading: false });
      return { 
        success: false, 
        message: `Error exporting data: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
}); 