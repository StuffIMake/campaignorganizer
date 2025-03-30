import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { 
  CloudUploadIcon,
  DeleteIcon,
  CloseIcon,
  HelpIcon, 
  ExpandMoreIcon,
  DownloadIcon,
  UploadIcon,
  EditIcon,
  AddIcon
} from '../assets/icons';
import { AssetManager, AssetType } from '../services/assetManager';
import { useStore } from '../store';
import JSONEditor from './JSONEditor';
import { Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from './ui';

interface AssetDropZoneProps {
  onAssetImport?: () => void;
  isFullPage?: boolean;
  dialogOpen?: boolean;
  onClose?: () => void;
}

export const AssetDropZone: React.FC<AssetDropZoneProps> = ({ 
  onAssetImport,
  isFullPage = false,
  dialogOpen = false,
  onClose
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if we have any assets in IndexedDB
  const [hasStoredAssets, setHasStoredAssets] = useState(false);
  const [isCheckingAssets, setIsCheckingAssets] = useState(true);
  
  // State for individual asset tabs
  const [tabValue, setTabValue] = useState(0);
  const [audioAssets, setAudioAssets] = useState<string[]>([]);
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  const [dataAssets, setDataAssets] = useState<string[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  
  // Get store methods for saving data
  const { saveDataToIndexedDB, exportToZip } = useStore();
  
  // Asset addition state
  const [currentAssetType, setCurrentAssetType] = useState<AssetType>('audio');
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  
  // JSON Editor state
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonFileToEdit, setJsonFileToEdit] = useState<string>('');
  const [isCreateJsonOpen, setIsCreateJsonOpen] = useState(false);
  const [newJsonFileName, setNewJsonFileName] = useState('');

  // Check for assets on component mount and load asset lists
  useEffect(() => {
    const checkAssets = async () => {
      setIsCheckingAssets(true);
      const hasAudio = await AssetManager.hasAssets('audio');
      const hasImages = await AssetManager.hasAssets('images');
      const hasData = await AssetManager.hasAssets('data');
      setHasStoredAssets(hasAudio || hasImages || hasData);
      setIsCheckingAssets(false);
      
      // Load asset lists
      await loadAssetLists();
    };
    
    checkAssets();
  }, []);
  
  // Load lists of assets for each type
  const loadAssetLists = async () => {
    setIsLoadingAssets(true);
    
    try {
      const audioAssets = await AssetManager.getAssets('audio');
      const imageAssets = await AssetManager.getAssets('images');
      const dataAssets = await AssetManager.getAssets('data');
      
      setAudioAssets(audioAssets.map(asset => asset.name));
      setImageAssets(imageAssets.map(asset => asset.name));
      setDataAssets(dataAssets.map(asset => asset.name));
      
      setIsLoadingAssets(false);
    } catch (error) {
      console.error('Error loading assets:', error);
      setIsLoadingAssets(false);
    }
  };
  
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
  
  // Handle drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  // Process the dropped file
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    await processFile(file);
  };
  
  // Process the selected file
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    await processFile(file);
  };
  
  // Common file processing logic
  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setResult({
        success: false,
        message: 'Please upload a .zip file containing audio, images, and data folders.'
      });
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const result = await AssetManager.processZipFile(file);
      setResult(result);
      
      if (result.success) {
        setHasStoredAssets(true);
        // Reload asset lists
        await loadAssetLists();
        if (onAssetImport) {
          onAssetImport();
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error processing file: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle clearing all assets
  const handleClearAssets = async () => {
    setIsProcessing(true);
    
    try {
      await AssetManager.clearAllAssets();
      setHasStoredAssets(false);
      // Clear asset lists
      setAudioAssets([]);
      setImageAssets([]);
      setDataAssets([]);
      setResult({
        success: true,
        message: 'All imported assets have been cleared.'
      });
      
      if (onAssetImport) {
        onAssetImport();
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error clearing assets: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle closing the result alert
  const handleCloseAlert = () => {
    setResult(null);
  };
  
  // Create empty data structure for new users
  const handleCreateEmptyData = async () => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const result = await AssetManager.loadExampleData();
      setResult(result);
      
      if (result.success) {
        setHasStoredAssets(true);
        // Reload asset lists
        await loadAssetLists();
        if (onAssetImport) {
          onAssetImport();
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error creating empty structure: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle opening the add asset dialog
  const handleAddAssetClick = (type: AssetType) => {
    setCurrentAssetType(type);
    setIsAddAssetDialogOpen(true);
  };
  
  // Handle selecting a file for individual asset upload
  const handleSingleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    setIsProcessing(true);
    try {
      const result = await AssetManager.addAsset(currentAssetType, file);
      setResult(result);
      
      if (result.success) {
        setHasStoredAssets(true);
        // Reload asset lists
        await loadAssetLists();
        if (onAssetImport) {
          onAssetImport();
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error adding asset: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
      setIsAddAssetDialogOpen(false);
      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = '';
      }
    }
  };
  
  // Handle deleting an individual asset
  const handleDeleteAsset = async (type: AssetType, name: string) => {
    setIsProcessing(true);
    try {
      const result = await AssetManager.deleteAsset(type, name);
      setResult(result);
      
      if (result.success) {
        // Reload asset lists
        await loadAssetLists();
        // Check if we still have assets
        const hasAudio = await AssetManager.hasAssets('audio');
        const hasImages = await AssetManager.hasAssets('images');
        const hasData = await AssetManager.hasAssets('data');
        setHasStoredAssets(hasAudio || hasImages || hasData);
        
        if (onAssetImport) {
          onAssetImport();
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error deleting asset: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Save data to IndexedDB
  const handleSaveData = async () => {
    setIsSaving(true);
    try {
      // Refresh the assets first to get the latest data
      await useStore.getState().refreshAssets();
      
      // Then save the current state
      const result = await saveDataToIndexedDB();
      setResult(result);
      
      if (result.success) {
        // Reload asset lists after successful save to ensure UI is up-to-date
        await loadAssetLists();
        
        // Call onAssetImport to update parent components if needed
        if (onAssetImport) {
          onAssetImport();
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error saving data: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Export all assets to a zip file
  const handleExportZip = async () => {
    setIsSaving(true);
    try {
      const result = await exportToZip();
      setResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success && result.url) {
        setExportUrl(result.url);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error exporting data: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Download the exported zip file
  const handleDownloadZip = () => {
    if (exportUrl) {
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = 'campaign-data.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Handle opening the JSON editor
  const handleEditJson = (fileName: string) => {
    setJsonFileToEdit(fileName);
    setIsJsonEditorOpen(true);
  };
  
  // Handle closing the JSON editor
  const handleCloseJsonEditor = () => {
    setIsJsonEditorOpen(false);
    setJsonFileToEdit('');
  };
  
  // Handle JSON editor save
  const handleJsonSave = async (success: boolean) => {
    if (success) {
      // Reload asset lists after successful save
      await loadAssetLists();
    }
  };
  
  // Handle creating a new JSON file
  const handleCreateJson = () => {
    setIsCreateJsonOpen(true);
  };
  
  // Handle new JSON file name change
  const handleNewJsonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let fileName = e.target.value;
    
    // Enforce .json extension
    if (fileName && !fileName.toLowerCase().endsWith('.json')) {
      fileName += '.json';
    }
    
    setNewJsonFileName(fileName);
  };
  
  // Create a new empty JSON file
  const handleCreateNewJsonFile = async () => {
    if (!newJsonFileName) return;
    
    setIsProcessing(true);
    try {
      // Create a new empty JSON object
      const emptyJson = {};
      
      // Save it to IndexedDB
      const result = await AssetManager.saveDataObject(newJsonFileName, emptyJson);
      
      if (result.success) {
        setResult(result);
        // Reload asset lists
        await loadAssetLists();
        // Close the dialog
        setIsCreateJsonOpen(false);
        setNewJsonFileName('');
        
        // Open the editor for the new file
        setJsonFileToEdit(newJsonFileName);
        setIsJsonEditorOpen(true);
      } else {
        setResult(result);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error creating JSON file: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render asset list for a specific type
  const renderAssetList = (type: AssetType, assets: string[]) => {
    if (isLoadingAssets) {
      return (
        <div className="flex justify-center p-2">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      );
    }
    
    if (assets.length === 0) {
      return (
        <p className="p-2 text-center text-gray-400 dark:text-gray-500">
          No {type} assets found. Add some using the "Add {type}" button.
        </p>
      );
    }
    
    return (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {assets.map((asset: string) => {
          const isPdf = type === 'images' && asset.toLowerCase().endsWith('.pdf');
          const isJson = type === 'data' && asset.toLowerCase().endsWith('.json');
          return (
            <li key={asset} className="flex justify-between items-center py-2 px-1">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{asset}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {type === 'data' ? 'JSON Data' : 
                  isPdf ? 'PDF Document' :
                  `${type.charAt(0).toUpperCase() + type.slice(1)} File`}
                </p>
              </div>
              <div className="flex space-x-1">
                {isJson && (
                  <button 
                    onClick={() => handleEditJson(asset)}
                    className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <EditIcon size={18} />
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteAsset(type, asset)}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <DeleteIcon size={18} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };
  
  // If still checking for assets, show a loading indicator
  if (isCheckingAssets) {
    return (
      <div 
        className="p-4 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-md relative w-full flex flex-col items-center justify-center min-h-[200px]"
      >
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-gray-200">
          Checking for stored assets...
        </p>
      </div>
    );
  }
  
  // Render content inside a Dialog if dialogOpen is true
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
          
          <button
            title={helpText}
            className="text-gray-400 hover:text-gray-300 p-1"
          >
            <HelpIcon size={20} />
          </button>
        </div>
        
        {/* Import section */}
        <div className="mb-4 bg-gray-700 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-3 cursor-pointer">
            <h3 className="text-base font-medium text-white">Import ZIP File</h3>
            <ExpandMoreIcon size={20} className="text-gray-400" />
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
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <div className="my-4 animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              ) : (
                <>
                  <CloudUploadIcon className="text-gray-400 h-10 w-10 mb-2" />
                  <p className="text-base text-white mb-1">
                    Drag & Drop a ZIP file here, or click to select
                  </p>
                  <p className="text-sm text-gray-400">
                    Your ZIP should contain audio/, images/, and data/ folders
                  </p>
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
            
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline"
                startIcon={<DeleteIcon />}
                onClick={handleClearAssets}
                disabled={isProcessing || !hasStoredAssets}
              >
                Clear All Assets
              </Button>
              
              {!hasStoredAssets && (
                <Button 
                  variant="outline"
                  onClick={handleCreateEmptyData}
                  disabled={isProcessing}
                >
                  Create Empty Structure
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Export section */}
        <div className="mb-4 bg-gray-700 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-3 cursor-pointer">
            <h3 className="text-base font-medium text-white">Export Campaign</h3>
            <ExpandMoreIcon size={20} className="text-gray-400" />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-300 mb-4">
              Export your entire campaign as a ZIP file to backup your work or share it with others.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Button 
                variant="primary"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={handleExportZip}
                disabled={isSaving || !hasStoredAssets}
              >
                {isSaving ? 'Preparing ZIP...' : 'Export Campaign ZIP'}
              </Button>
              
              <Button 
                variant="outline"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={handleDownloadZip}
                disabled={!exportUrl}
              >
                Download ZIP
              </Button>
            </div>
            
            <Button
              variant="outline"
              fullWidth
              onClick={handleSaveData}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Current Campaign State'}
            </Button>
          </div>
        </div>
        
        {/* Individual asset management */}
        <div className="bg-gray-700 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-3 cursor-pointer">
            <h3 className="text-base font-medium text-white">Manage Individual Assets</h3>
            <ExpandMoreIcon size={20} className="text-gray-400" />
          </div>
          <div className="p-4">
            <div className="border-b border-gray-600 mb-4">
              <div className="flex space-x-4">
                <button 
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${tabValue === 0 ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'}`}
                  onClick={(e) => handleTabChange(e, 0)}
                >
                  Audio
                </button>
                <button 
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${tabValue === 1 ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'}`}
                  onClick={(e) => handleTabChange(e, 1)}
                >
                  Images
                </button>
                <button 
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${tabValue === 2 ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'}`}
                  onClick={(e) => handleTabChange(e, 2)}
                >
                  Data
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <Button
                  variant="outline"
                  size="small"
                  startIcon={<UploadIcon size={16} />}
                  onClick={() => handleAddAssetClick(tabValue === 0 ? 'audio' : tabValue === 1 ? 'images' : 'data')}
                >
                  Add {tabValue === 0 ? 'Audio' : tabValue === 1 ? 'Image' : 'Data'} File
                </Button>
                
                {tabValue === 2 && (
                  <Button
                    variant="outline"
                    size="small"
                    startIcon={<AddIcon size={16} />}
                    onClick={handleCreateJson}
                  >
                    Create New JSON
                  </Button>
                )}
              </div>
              
              {/* Tab panels */}
              <div className={tabValue !== 0 ? 'hidden' : ''}>
                {tabValue === 0 && renderAssetList('audio', audioAssets)}
              </div>
              <div className={tabValue !== 1 ? 'hidden' : ''}>
                {tabValue === 1 && renderAssetList('images', imageAssets)}
              </div>
              <div className={tabValue !== 2 ? 'hidden' : ''}>
                {tabValue === 2 && renderAssetList('data', dataAssets)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Result message */}
        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'}
            title={result.success ? 'Success' : 'Error'}
            onClose={handleCloseAlert}
            className="mt-4"
          >
            {result.message}
          </Alert>
        )}
      </div>
      
      {/* Dialog for adding individual assets */}
      <Dialog
        open={isAddAssetDialogOpen}
        onClose={() => setIsAddAssetDialogOpen(false)}
      >
        <DialogTitle>Add Asset</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-400 mb-4">
            {currentAssetType === 'audio' && 'Select an audio file (MP3, WAV, OGG)'}
            {currentAssetType === 'images' && 'Select an image file (PNG, JPG, GIF) or a PDF document'}
            {currentAssetType === 'data' && 'Select a JSON data file'}
          </p>
          
          <Button
            variant="primary"
            fullWidth
            onClick={() => singleFileInputRef.current?.click()}
          >
            Choose File
            <input
              type="file"
              ref={singleFileInputRef}
              className="hidden"
              onChange={handleSingleFileSelect}
              accept={
                currentAssetType === 'audio' ? 'audio/*' :
                currentAssetType === 'images' ? 'image/*,.pdf' :
                '.json'
              }
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddAssetDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for creating a new JSON file */}
      <Dialog
        open={isCreateJsonOpen}
        onClose={() => setIsCreateJsonOpen(false)}
      >
        <DialogTitle>Create JSON File</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-400 mb-4">
            Enter a filename for the new JSON file. The .json extension will be added automatically if needed.
          </p>
          
          <TextField
            label="Filename"
            value={newJsonFileName}
            onChange={handleNewJsonNameChange}
            fullWidth
            placeholder="e.g., mydata.json"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateJsonOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateNewJsonFile} disabled={!newJsonFileName || isSaving}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* JSON Editor Dialog */}
      <Dialog
        open={isJsonEditorOpen}
        onClose={handleCloseJsonEditor}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Editing {jsonFileToEdit}</DialogTitle>
        <DialogContent>
          <JSONEditor 
            fileName={jsonFileToEdit} 
            onSave={handleJsonSave}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJsonEditor}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  // Return content wrapped in Dialog if dialogOpen is true
  if (dialogOpen && onClose) {
    return (
      <Dialog
        open={dialogOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Asset Manager</DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Return content directly if not in dialog mode
  return content;
}; 