import React, { useState, useEffect } from 'react';
import { CustomLocation } from '../../store';
import { 
  Dialog, 
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Stack,
  Chip
} from '../ui';
import { CancelIcon } from '../../assets/icons';
import { AssetManager } from '../../services/assetManager';

interface EditLocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (location: CustomLocation) => void;
  location: CustomLocation | null;
  locations: CustomLocation[];
}

const EditLocationDialog: React.FC<EditLocationDialogProps> = ({
  open,
  onClose,
  onSave,
  location,
  locations
}) => {
  const [editingLocation, setEditingLocation] = useState<CustomLocation | null>(null);
  const [audioAssets, setAudioAssets] = useState<string[]>([]);
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  
  // Initialize the form when a location is provided
  useEffect(() => {
    if (location) {
      setEditingLocation({...location});
    }
  }, [location]);
  
  // Load available assets when the dialog opens
  useEffect(() => {
    if (open) {
      const loadAssets = async () => {
        try {
          const audioList = await AssetManager.getAssets('audio');
          const imageList = await AssetManager.getAssets('images');
          
          setAudioAssets(audioList.map(asset => asset.name));
          setImageAssets(imageList.map(asset => asset.name));
        } catch (error) {
          console.error('Failed to load assets:', error);
        }
      };
      
      loadAssets();
    }
  }, [open]);
  
  const handleSave = () => {
    if (editingLocation) {
      onSave(editingLocation);
      onClose();
    }
  };
  
  const handleChange = (field: keyof CustomLocation, value: any) => {
    if (editingLocation) {
      setEditingLocation({
        ...editingLocation,
        [field]: value
      });
    }
  };
  
  // Handle adding a connected location
  const handleAddConnectedLocation = (locationId: string) => {
    if (editingLocation) {
      const connectedLocations = editingLocation.connectedLocations || [];
      if (!connectedLocations.includes(locationId)) {
        setEditingLocation({
          ...editingLocation,
          connectedLocations: [...connectedLocations, locationId]
        });
      }
    }
  };
  
  // Handle removing a connected location
  const handleRemoveConnectedLocation = (locationId: string) => {
    if (editingLocation?.connectedLocations) {
      setEditingLocation({
        ...editingLocation,
        connectedLocations: editingLocation.connectedLocations.filter(id => id !== locationId)
      });
    }
  };
  
  // Get a list of locations that can be connected (exclude self)
  const getAvailableLocations = () => {
    return locations.filter(loc => loc.id !== editingLocation?.id);
  };
  
  if (!editingLocation) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        Edit Location
        <IconButton
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CancelIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={4} className="p-2">
          <TextField
            label="Name"
            fullWidth
            value={editingLocation.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editingLocation.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          
          <Box>
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Map Image
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={editingLocation.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
              >
                <option value="">No image selected</option>
                {imageAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
            </Box>
            
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Background Music
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={editingLocation.backgroundMusic || ''}
                onChange={(e) => handleChange('backgroundMusic', e.target.value)}
              >
                <option value="">No music selected</option>
                {audioAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
            </Box>
            
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Sound
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={editingLocation.entrySound || ''}
                onChange={(e) => handleChange('entrySound', e.target.value)}
              >
                <option value="">No sound selected</option>
                {audioAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
            </Box>
          </Box>
          
          {editingLocation.coordinates && (
            <Box className="flex gap-4">
              <TextField
                label="X Coordinate"
                type="number"
                InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
                value={editingLocation.coordinates[0]}
                onChange={(e) => {
                  const x = parseFloat(e.target.value);
                  const y = editingLocation.coordinates ? editingLocation.coordinates[1] : 0;
                  handleChange('coordinates', [x, y]);
                }}
              />
              <TextField
                label="Y Coordinate"
                type="number"
                InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
                value={editingLocation.coordinates[1]}
                onChange={(e) => {
                  const x = editingLocation.coordinates ? editingLocation.coordinates[0] : 0;
                  const y = parseFloat(e.target.value);
                  handleChange('coordinates', [x, y]);
                }}
              />
            </Box>
          )}
          
          <Box>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connected Locations
            </label>
            <Box className="flex flex-wrap gap-1 mb-2">
              {editingLocation.connectedLocations?.map(locId => {
                const connectedLoc = locations.find(l => l.id === locId);
                if (!connectedLoc) return null;
                
                return (
                  <Chip 
                    key={locId}
                    label={connectedLoc.name}
                    onDelete={() => handleRemoveConnectedLocation(locId)}
                    size="small"
                  />
                );
              })}
              {!editingLocation.connectedLocations?.length && (
                <Box className="text-gray-500 text-sm">No connected locations</Box>
              )}
            </Box>
            
            <Box className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Connection
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddConnectedLocation(e.target.value);
                    e.target.value = ''; // Reset after selection
                  }
                }}
                value=""
              >
                <option value="">Select a location to connect</option>
                {getAvailableLocations()
                  .filter(loc => !editingLocation.connectedLocations?.includes(loc.id))
                  .map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))
                }
              </select>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLocationDialog; 