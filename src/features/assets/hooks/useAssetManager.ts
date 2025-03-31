import { useState, useEffect } from 'react';
import { AssetManager, AssetType } from '../../../services/assetManager';
import { useStore } from '../../../store';

export const useAssetManager = () => {
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Get asset state from the store
  const {
    audioAssets,
    imageAssets,
    dataAssets,
    hasAssets,
    isLoading: isLoadingAssets,
    refreshAssets,
    saveDataToIndexedDB,
    exportToZip
  } = useStore();
  
  // Process a zip file containing assets
  const processZipFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setResult({
        success: false,
        message: 'Please upload a .zip file containing audio, images, and data folders.'
      });
      return;
    }
    
    // Check file size and warn if it's large
    const fileSizeMB = file.size / (1024 * 1024);
    const MAX_RECOMMENDED_SIZE = 200; // 200MB
    
    if (fileSizeMB > MAX_RECOMMENDED_SIZE) {
      // Still allow upload but warn the user it may take time
      setResult({
        success: true,
        message: `Warning: The file is ${fileSizeMB.toFixed(1)}MB, which is quite large. Processing may take some time and require sufficient memory.`
      });
      // Short delay to allow the user to see the warning
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setIsProcessing(true);
    setResult({
      success: true,
      message: 'Processing zip file... This may take a few moments for large files.'
    });
    
    try {
      const result = await AssetManager.processZipFile(file);
      setResult(result);
      
      if (result.success) {
        // Refresh the store data
        await refreshAssets();
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setResult({
        success: false,
        message: `Error processing file: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Add a single asset
  const addAsset = async (type: AssetType, file: File) => {
    setIsProcessing(true);
    
    try {
      const result = await AssetManager.addAsset(type, file);
      setResult(result);
      
      if (result.success) {
        // Refresh the store data
        await refreshAssets();
      }
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Error adding asset: ${error instanceof Error ? error.message : String(error)}`
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Delete an asset
  const deleteAsset = async (type: AssetType, name: string) => {
    setIsProcessing(true);
    
    try {
      const result = await AssetManager.deleteAsset(type, name);
      setResult(result);
      
      if (result.success) {
        // Refresh store data
        await refreshAssets();
      }
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Error deleting asset: ${error instanceof Error ? error.message : String(error)}`
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Clear all assets
  const clearAllAssets = async () => {
    setIsProcessing(true);
    
    try {
      await AssetManager.clearAllAssets();
      
      setResult({
        success: true,
        message: 'All imported assets have been cleared.'
      });
      
      // Refresh the store data
      await refreshAssets();
      
      return { success: true, message: 'All imported assets have been cleared.' };
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Error clearing assets: ${error instanceof Error ? error.message : String(error)}`
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Create sample data structure
  const createSampleData = async () => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const result = await AssetManager.loadExampleData();
      setResult(result);
      
      if (result.success) {
        // Refresh the store data
        await refreshAssets();
      }
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Error creating sample data: ${error instanceof Error ? error.message : String(error)}`
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Export data to JSON
  const exportData = async () => {
    setIsProcessing(true);
    
    try {
      await saveDataToIndexedDB();
      const exportResult = await exportToZip();
      
      setResult({
        success: exportResult.success,
        message: exportResult.message
      });
      
      return exportResult;
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Error exporting data: ${error instanceof Error ? error.message : String(error)}`
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Drag event handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    await processZipFile(file);
  };
  
  // Clear result message
  const clearResult = () => {
    setResult(null);
  };
  
  // Load asset lists from the store - this is now simply refreshing the store state
  const loadAssetLists = async () => {
    await refreshAssets();
  };
  
  return {
    // State from store
    audioAssets,
    imageAssets,
    dataAssets,
    hasStoredAssets: hasAssets,
    isLoadingAssets,
    
    // Local state
    isProcessing,
    isDragging,
    result,
    
    // Actions
    processZipFile,
    addAsset,
    deleteAsset,
    clearAllAssets,
    createSampleData,
    exportData,
    loadAssetLists,
    
    // Event handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearResult
  };
}; 