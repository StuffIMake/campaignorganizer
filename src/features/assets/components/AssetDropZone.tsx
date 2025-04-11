import React, { useRef, useCallback } from 'react';
import { 
  CloudUploadIcon,
  DeleteIcon,
  CloseIcon,
  HelpIcon, 
  ExpandMoreIcon,
  DownloadIcon,
  UploadIcon
} from '../../../assets/icons';
import { AssetType } from '../../../services/assetManager';
import { useAssetManager } from '../hooks';
import {
  Alert,
  Button,
  Box,
  Typography,
  CircularProgress
} from '../../../components/ui';
import { withMemo } from '../../../utils/performance';

interface AssetDropZoneProps {
  onAssetImport?: () => void;
  isFullPage?: boolean;
  dialogOpen?: boolean;
  onClose?: () => void;
}

// Define the component without exporting it directly
const AssetDropZoneComponent: React.FC<AssetDropZoneProps> = ({ 
  onAssetImport,
  isFullPage = false,
  dialogOpen = false,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add refs for individual file inputs
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const dataFileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isDragging,
    isProcessing,
    result,
    hasStoredAssets,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    processZipFile,
    clearResult,
    clearAllAssets,
    createSampleData,
    exportData,
    addAsset
  } = useAssetManager();
  
  // Additional help text for formatting requirements
  const helpText = `
Your zip file should contain:

1. /audio folder - with mp3, wav, or ogg files
2. /images folder - with jpg, png, gif, or pdf files
3. /data folder - with JSON files:
   - locations.json: Array of location objects with id, name, description
   - characters.json: Array of character objects

Example locations.json:
[
  {
    "id": "tavern",
    "name": "The Rusty Tankard",
    "description": "A cozy tavern with a fireplace.",
    "backgroundMusic": "tavern_ambience.mp3"
  }
]
  `;
  
  // Handle file selection through the file input - use useCallback to maintain reference stability
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    await processZipFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Call the callback if provided
    if (onAssetImport) {
      onAssetImport();
    }
  }, [processZipFile, onAssetImport]);
  
  // Handle asset creation - memoize the callback
  const handleCreateEmptyData = useCallback(async () => {
    const result = await createSampleData();
    if (result.success && onAssetImport) {
      onAssetImport();
    }
  }, [createSampleData, onAssetImport]);
  
  // Export data - memoize the callback
  const handleExportData = useCallback(async () => {
    await exportData();
  }, [exportData]);
  
  // Clear assets - memoize the callback
  const handleClearAssets = useCallback(async () => {
    const result = await clearAllAssets();
    if (result.success && onAssetImport) {
      onAssetImport();
    }
  }, [clearAllAssets, onAssetImport]);
  
  // Memoize the click handler for the file input
  const handleClickFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Handle individual file selection
  const handleIndividualFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: AssetType) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file in the selection
    const results = await Promise.all(
      Array.from(files).map(file => addAsset(type, file))
    );
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
    
    // Call the callback if provided
    if (onAssetImport) {
      onAssetImport();
    }
  }, [addAsset, onAssetImport]);
  
  // Handlers for individual file type selection
  const handleAudioFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleIndividualFileSelect(e, 'audio');
  }, [handleIndividualFileSelect]);
  
  const handleImageFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleIndividualFileSelect(e, 'images');
  }, [handleIndividualFileSelect]);
  
  const handleDataFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleIndividualFileSelect(e, 'data');
  }, [handleIndividualFileSelect]);
  
  // Click handlers for file inputs
  const handleClickAudioInput = useCallback(() => {
    audioFileInputRef.current?.click();
  }, []);
  
  const handleClickImageInput = useCallback(() => {
    imageFileInputRef.current?.click();
  }, []);
  
  const handleClickDataInput = useCallback(() => {
    dataFileInputRef.current?.click();
  }, []);
  
  // Render content based on whether it's in a dialog or not
  const content = (
    <div 
      className={`asset-drop-zone ${isDragging ? 'dragging' : ''} ${isFullPage ? 'h-full' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-md relative w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Asset Manager
          </h2>
          
          <div className="flex items-center">
            <button
              title={helpText}
              className="text-gray-400 hover:text-gray-300 p-1 ml-2"
            >
              <HelpIcon />
            </button>
            
            {dialogOpen && onClose && (
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 p-1 ml-2"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
        
        {/* Import section */}
        <div className="mb-4 bg-gray-700 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-3">
            <h3 className="text-base font-medium text-white">Import ZIP File</h3>
            <ExpandMoreIcon className="text-gray-400" />
          </div>
          <div className="p-4">
            <div 
              className={`
                border-2 border-dashed rounded-lg p-6 
                flex flex-col items-center justify-center 
                cursor-pointer transition-colors duration-200
                ${isDragging ? 'border-blue-500 bg-blue-900 bg-opacity-10' : 'border-gray-500'} 
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClickFileInput}
            >
              {isProcessing ? (
                <CircularProgress className="my-4" />
              ) : (
                <>
                  <CloudUploadIcon className="text-gray-400 h-10 w-10 mb-2" />
                  <Typography variant="body1" className="text-white mb-1">
                    Drag & Drop a ZIP file here, or click to select
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Your ZIP should contain audio/, images/, and data/ folders
                  </Typography>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".zip"
              />
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<UploadIcon />}
                onPress={handleClickFileInput}
                isDisabled={isProcessing}
              >
                Select ZIP
              </Button>
              
              <Button
                variant="outlined" 
                color="primary"
                startIcon={<DownloadIcon />}
                onPress={handleExportData}
                isDisabled={isProcessing || !hasStoredAssets}
              >
                Export Data
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onPress={handleCreateEmptyData}
                isDisabled={isProcessing}
              >
                Create Sample Data
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onPress={handleClearAssets}
                isDisabled={isProcessing || !hasStoredAssets}
              >
                Clear Assets
              </Button>
            </div>
          </div>
        </div>
        
        {/* Individual File Upload Section */}
        <div className="mb-4 bg-gray-700 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-3">
            <h3 className="text-base font-medium text-white">Upload Individual Files</h3>
            <ExpandMoreIcon className="text-gray-400" />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Audio Files */}
              <div className="border border-gray-600 rounded-lg p-3">
                <Typography variant="body1" className="text-white mb-2">
                  Audio Files
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onPress={handleClickAudioInput}
                  isDisabled={isProcessing}
                  className="w-full"
                >
                  Select Audio
                </Button>
                <Typography variant="body2" className="text-gray-400 mt-2">
                  Supported: MP3, WAV, OGG
                </Typography>
                <input
                  type="file"
                  ref={audioFileInputRef}
                  onChange={handleAudioFileSelect}
                  className="hidden"
                  accept="audio/*"
                  multiple
                />
              </div>
              
              {/* Image Files */}
              <div className="border border-gray-600 rounded-lg p-3">
                <Typography variant="body1" className="text-white mb-2">
                  Image Files
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onPress={handleClickImageInput}
                  isDisabled={isProcessing}
                  className="w-full"
                >
                  Select Images
                </Button>
                <Typography variant="body2" className="text-gray-400 mt-2">
                  Supported: JPG, PNG, GIF, SVG
                </Typography>
                <input
                  type="file"
                  ref={imageFileInputRef}
                  onChange={handleImageFileSelect}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
              </div>
              
              {/* Data Files */}
              <div className="border border-gray-600 rounded-lg p-3">
                <Typography variant="body1" className="text-white mb-2">
                  Data Files
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onPress={handleClickDataInput}
                  isDisabled={isProcessing}
                  className="w-full"
                >
                  Select Data
                </Button>
                <Typography variant="body2" className="text-gray-400 mt-2">
                  Supported: JSON, TXT, PDF
                </Typography>
                <input
                  type="file"
                  ref={dataFileInputRef}
                  onChange={handleDataFileSelect}
                  className="hidden"
                  accept=".json,.txt,.pdf"
                  multiple
                />
              </div>
            </div>
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-center items-center mt-4">
                <CircularProgress />
                <Typography variant="body2" className="text-white ml-2">
                  Processing files...
                </Typography>
              </div>
            )}
          </div>
        </div>
        
        {/* Result message */}
        {result && (
          <Alert 
            severity={result.success ? "success" : "error"}
            onClose={clearResult}
            className="mt-4"
          >
            {result.message}
          </Alert>
        )}
      </div>
    </div>
  );
  
  // If in a dialog, wrap in a dialog component
  if (dialogOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-3xl">
          {content}
        </div>
      </div>
    );
  }
  
  // Otherwise return the content directly
  return content;
};

// Export a memoized version of the component
export const AssetDropZone = withMemo(AssetDropZoneComponent, 'AssetDropZone'); 