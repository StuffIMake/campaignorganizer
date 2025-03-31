import React, { useRef, useCallback } from 'react';
import { 
  DeleteIcon, 
  EditIcon, 
  AddIcon 
} from '../../../assets/icons';
import { AssetType } from '../../../services/assetManager';
import { useAssetManager, useJsonEditor } from '../hooks';
import {
  Typography,
  Button,
  List,
  ListItem,
  Divider,
  Box,
  IconButton,
  CircularProgress
} from '../../../components/ui';
import { withMemo } from '../../../utils/performance';

interface AssetListProps {
  type: AssetType;
  title: string;
}

// Define the component without exporting it
const AssetListComponent: React.FC<AssetListProps> = ({ type, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    audioAssets,
    imageAssets,
    dataAssets,
    isLoadingAssets,
    addAsset,
    deleteAsset
  } = useAssetManager();
  
  const { loadJsonContent } = useJsonEditor();
  
  // Get the appropriate assets based on type
  const assets = type === 'audio' 
    ? audioAssets 
    : type === 'images' 
      ? imageAssets 
      : dataAssets;
  
  // Memoize event handlers to prevent re-creation on every render
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    await addAsset(type, file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addAsset, type]);
  
  // Open file dialog to select asset
  const handleAddAssetClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Delete an asset
  const handleDeleteAsset = useCallback(async (assetName: string) => {
    if (window.confirm(`Are you sure you want to delete ${assetName}?`)) {
      await deleteAsset(type, assetName);
    }
  }, [deleteAsset, type]);
  
  // Edit a JSON file
  const handleEditJson = useCallback(async (fileName: string) => {
    await loadJsonContent(fileName);
  }, [loadJsonContent]);
  
  // Show loading state while loading assets
  if (isLoadingAssets) {
    return (
      <Box className="p-4 bg-gray-800 rounded-lg mb-4">
        <Typography variant="h6" className="mb-2">{title}</Typography>
        <Box className="flex justify-center p-4">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Render asset list items
  const renderAssetItem = useCallback((asset: string) => {
    const isPdf = type === 'images' && asset.toLowerCase().endsWith('.pdf');
    const isJson = type === 'data' && asset.toLowerCase().endsWith('.json');
    
    return (
      <ListItem 
        key={asset} 
        className="flex justify-between items-center py-2"
      >
        <div>
          <Typography variant="body2" className="font-medium text-gray-200">
            {asset}
          </Typography>
          <Typography variant="caption" className="text-gray-400">
            {type === 'data'
              ? 'JSON Data'
              : isPdf 
                ? 'PDF Document' 
                : `${title} File`
            }
          </Typography>
        </div>
        
        <div className="flex space-x-1">
          {isJson && (
            <IconButton
              size="small"
              onClick={() => handleEditJson(asset)}
              className="text-blue-400 hover:text-blue-300"
            >
              <EditIcon />
            </IconButton>
          )}
          
          <IconButton
            size="small"
            onClick={() => handleDeleteAsset(asset)}
            className="text-red-400 hover:text-red-300"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </ListItem>
    );
  }, [type, title, handleDeleteAsset, handleEditJson]);
  
  return (
    <Box className="p-4 bg-gray-800 rounded-lg mb-4">
      <Box className="flex justify-between items-center mb-2">
        <Typography variant="h6">{title}</Typography>
        
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddAssetClick}
        >
          Add {title}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept={type === 'audio' 
            ? ".mp3,.wav,.ogg" 
            : type === 'images' 
              ? ".jpg,.jpeg,.png,.gif,.pdf" 
              : ".json"
          }
        />
      </Box>
      
      {assets.length > 0 ? (
        <List className="divide-y divide-gray-700">
          {assets.map(renderAssetItem)}
        </List>
      ) : (
        <Box className="p-4 text-center text-gray-400">
          No {title.toLowerCase()} assets found. Add some using the "Add {title}" button.
        </Box>
      )}
    </Box>
  );
};

// Export a memoized version of the component
export const AssetList = withMemo(AssetListComponent, 'AssetList'); 