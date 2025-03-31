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
    exportData
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
                onClick={handleClickFileInput}
                disabled={isProcessing}
              >
                Select ZIP
              </Button>
              
              <Button
                variant="outlined" 
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
                disabled={isProcessing || !hasStoredAssets}
              >
                Export Data
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCreateEmptyData}
                disabled={isProcessing}
              >
                Create Sample Data
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAssets}
                disabled={isProcessing || !hasStoredAssets}
              >
                Clear Assets
              </Button>
            </div>
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