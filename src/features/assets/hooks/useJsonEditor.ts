import { useState } from 'react';
import { AssetManager } from '../../../services/assetManager';

export const useJsonEditor = () => {
  // Editor state
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonFileToEdit, setJsonFileToEdit] = useState<string>('');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog for creating new JSON files
  const [isCreateJsonOpen, setIsCreateJsonOpen] = useState(false);
  const [newJsonFileName, setNewJsonFileName] = useState('');
  
  // Load JSON content for editing
  const loadJsonContent = async (fileName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const asset = await AssetManager.getAssetByName('data', fileName);
      
      if (!asset) {
        throw new Error(`JSON file ${fileName} not found`);
      }
      
      // If data is already a JSON string (new format)
      if (typeof asset.data === 'string' && (asset.data.startsWith('{') || asset.data.startsWith('['))) {
        // Format JSON with proper indentation for editing
        const jsonObj = JSON.parse(asset.data);
        setJsonContent(JSON.stringify(jsonObj, null, 2));
      } else {
        // Try to decode from base64 (old format)
        try {
          const jsonString = atob(asset.data);
          const jsonObj = JSON.parse(jsonString);
          setJsonContent(JSON.stringify(jsonObj, null, 2));
        } catch (e) {
          throw new Error(`Failed to parse JSON data from ${fileName}`);
        }
      }
      
      setJsonFileToEdit(fileName);
      setIsJsonEditorOpen(true);
    } catch (error) {
      console.error('Error loading JSON content:', error);
      setError(`Error loading JSON content: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save edited JSON content
  const saveJsonContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate JSON by parsing it
      const jsonObj = JSON.parse(jsonContent);
      
      // Create a JSON Blob from the content
      const jsonBlob = new Blob([JSON.stringify(jsonObj)], { type: 'application/json' });
      
      // Convert to File object for AssetManager
      const file = new File([jsonBlob], jsonFileToEdit, { type: 'application/json' });
      
      // Save using AssetManager
      const result = await AssetManager.addAsset('data', file);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Close the editor on success
      setIsJsonEditorOpen(false);
      return { success: true, message: `JSON file ${jsonFileToEdit} saved successfully` };
    } catch (error) {
      console.error('Error saving JSON content:', error);
      setError(`Error saving JSON content: ${error instanceof Error ? error.message : String(error)}`);
      return { 
        success: false, 
        message: `Error saving JSON content: ${error instanceof Error ? error.message : String(error)}` 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new JSON file
  const createNewJsonFile = async (content = '{}') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure filename has .json extension
      const fileName = newJsonFileName.endsWith('.json') 
        ? newJsonFileName 
        : `${newJsonFileName}.json`;
      
      // Create a JSON Blob from the content
      const jsonBlob = new Blob([content], { type: 'application/json' });
      
      // Convert to File object for AssetManager
      const file = new File([jsonBlob], fileName, { type: 'application/json' });
      
      // Save using AssetManager
      const result = await AssetManager.addAsset('data', file);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Reset and close dialog
      setNewJsonFileName('');
      setIsCreateJsonOpen(false);
      
      // Open editor with the new file
      await loadJsonContent(fileName);
      
      return { success: true, message: `New JSON file ${fileName} created successfully` };
    } catch (error) {
      console.error('Error creating JSON file:', error);
      setError(`Error creating JSON file: ${error instanceof Error ? error.message : String(error)}`);
      return { 
        success: false, 
        message: `Error creating JSON file: ${error instanceof Error ? error.message : String(error)}` 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    // State
    isJsonEditorOpen,
    jsonFileToEdit,
    jsonContent,
    isLoading,
    error,
    isCreateJsonOpen,
    newJsonFileName,
    
    // Setters
    setIsJsonEditorOpen,
    setJsonFileToEdit,
    setJsonContent,
    setIsCreateJsonOpen,
    setNewJsonFileName,
    
    // Actions
    loadJsonContent,
    saveJsonContent,
    createNewJsonFile
  };
}; 