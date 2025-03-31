import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Button 
} from '../../../components/ui';
import { 
  AssetDropZone,
  AssetList,
  JsonEditor,
  NewJsonDialog
} from '../components';
import { useAssetManager, useJsonEditor } from '../hooks';
import { AddIcon } from '../../../assets/icons';

export const AssetsView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showAssetManager, setShowAssetManager] = useState(false);
  
  const { hasStoredAssets, loadAssetLists } = useAssetManager();
  const { setIsCreateJsonOpen } = useJsonEditor();
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle refreshing asset data
  const handleAssetImport = () => {
    loadAssetLists();
  };
  
  // Open new JSON dialog
  const handleCreateNewJson = () => {
    setIsCreateJsonOpen(true);
  };
  
  return (
    <div className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Assets
        </Typography>
        
        <div className="space-x-2">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAssetManager(true)}
          >
            Import/Export Assets
          </Button>
          
          {tabValue === 2 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateNewJson}
            >
              Create New JSON
            </Button>
          )}
        </div>
      </Box>
      
      {!hasStoredAssets ? (
        <AssetDropZone isFullPage onAssetImport={handleAssetImport} />
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="mb-4">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="asset tabs"
            >
              <Tab label="Audio" />
              <Tab label="Images" />
              <Tab label="Data" />
            </Tabs>
          </Box>
          
          <Box className="hidden" sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
            <AssetList type="audio" title="Audio" />
          </Box>
          
          <Box className="hidden" sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
            <AssetList type="images" title="Images" />
          </Box>
          
          <Box className="hidden" sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
            <AssetList type="data" title="Data" />
          </Box>
          
          {/* Dialogs and modals */}
          <JsonEditor />
          <NewJsonDialog />
          
          {/* Asset manager dialog */}
          {showAssetManager && (
            <AssetDropZone 
              dialogOpen={showAssetManager} 
              onClose={() => setShowAssetManager(false)}
              onAssetImport={handleAssetImport}
            />
          )}
        </>
      )}
    </div>
  );
}; 