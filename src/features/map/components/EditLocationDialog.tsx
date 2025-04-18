import React, { useState, useEffect } from 'react';
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
} from '../../../components/ui';
import { Combobox } from '@headlessui/react';
import { CancelIcon } from '../../../assets/icons';
import { AssetManager } from '../../../services/assetManager';
import { Location as LocationType } from '../../../types/location';

interface EditLocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (location: LocationType) => void;
  location: LocationType | null;
  locations: LocationType[];
}

const EditLocationDialog: React.FC<EditLocationDialogProps> = ({
  open,
  onClose,
  onSave,
  location,
  locations
}) => {
  const [editingLocationType, setEditingLocationType] = useState<LocationType | null>(null);
  const [audioAssets, setAudioAssets] = useState<string[]>([]);
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  
  // Add search query states for each dropdown
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [bgMusicSearchQuery, setBgMusicSearchQuery] = useState('');
  const [entrySoundSearchQuery, setEntrySoundSearchQuery] = useState('');
  const [connectedLocationsSearchQuery, setConnectedLocationsSearchQuery] = useState('');
  
  // Initialize the form when a location is provided
  useEffect(() => {
    if (location) {
      setEditingLocationType({...location});
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
    if (editingLocationType) {
      onSave(editingLocationType);
      onClose();
    }
  };
  
  const handleChange = (field: keyof LocationType, value: any) => {
    if (editingLocationType) {
      setEditingLocationType({
        ...editingLocationType,
        [field]: value
      });
    }
  };
  
  // Handle adding a connected location
  const handleAddConnectedLocationType = (locationId: string) => {
    if (editingLocationType) {
      const connectedLocations = editingLocationType.connectedLocations || [];
      if (!connectedLocations.includes(locationId)) {
        setEditingLocationType({
          ...editingLocationType,
          connectedLocations: [...connectedLocations, locationId]
        });
      }
    }
  };
  
  // Handle removing a connected location
  const handleRemoveConnectedLocationType = (locationId: string) => {
    if (editingLocationType?.connectedLocations) {
      setEditingLocationType({
        ...editingLocationType,
        connectedLocations: editingLocationType.connectedLocations.filter(id => id !== locationId)
      });
    }
  };
  
  // Get a list of locations that can be connected (exclude self)
  const getAvailableLocations = () => {
    return locations.filter(loc => loc.id !== editingLocationType?.id);
  };
  
  // Filter functions for dropdowns
  const filteredImageAssets = React.useMemo(() => {
    if (!imageSearchQuery) return imageAssets;
    const query = imageSearchQuery.toLowerCase();
    return imageAssets.filter(asset => 
      asset.toLowerCase().includes(query)
    );
  }, [imageAssets, imageSearchQuery]);
  
  const filteredBgMusicAssets = React.useMemo(() => {
    if (!bgMusicSearchQuery) return audioAssets;
    const query = bgMusicSearchQuery.toLowerCase();
    return audioAssets.filter(asset => 
      asset.toLowerCase().includes(query)
    );
  }, [audioAssets, bgMusicSearchQuery]);
  
  const filteredEntrySoundAssets = React.useMemo(() => {
    if (!entrySoundSearchQuery) return audioAssets;
    const query = entrySoundSearchQuery.toLowerCase();
    return audioAssets.filter(asset => 
      asset.toLowerCase().includes(query)
    );
  }, [audioAssets, entrySoundSearchQuery]);
  
  const filteredConnectedLocations = React.useMemo(() => {
    if (!connectedLocationsSearchQuery) return getAvailableLocations();
    const query = connectedLocationsSearchQuery.toLowerCase();
    return getAvailableLocations().filter(location => 
      location.name.toLowerCase().includes(query)
    );
  }, [locations, connectedLocationsSearchQuery]);
  
  if (!editingLocationType) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        Edit LocationType
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
            value={editingLocationType.name}
            onChange={(value) => handleChange('name', value)}
            aria-label="LocationType name"
          />
          
          <TextField
            label="Description"
            fullWidth
            value={editingLocationType.description || ''}
            onChange={(value) => handleChange('description', value)}
            aria-label="LocationType description"
            InputProps={{
              inputProps: {
                style: { minHeight: '100px' }
              }
            }}
          />
          
          <Box>
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Map Image
              </label>
              <Combobox 
                value={editingLocationType.imageUrl || ''}
                onChange={(value: string) => handleChange('imageUrl', value)}
              >
                <div className="relative w-full">
                  <Combobox.Input
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                    displayValue={(value: string) => value || 'No image selected'}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
                  <Combobox.Option 
                    value=""
                    className={({ active }) =>
                      `cursor-default select-none relative py-2 px-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                      }`
                    }
                  >
                    No image selected
                  </Combobox.Option>
                  {filteredImageAssets.map((asset) => (
                    <Combobox.Option
                      key={asset}
                      value={asset}
                      className={({ active }) =>
                        `cursor-default select-none relative py-2 px-4 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {asset}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Box>
            
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Background Music
              </label>
              <Combobox 
                value={editingLocationType.backgroundMusic || ''}
                onChange={(value: string) => handleChange('backgroundMusic', value)}
              >
                <div className="relative w-full">
                  <Combobox.Input
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    onChange={(e) => setBgMusicSearchQuery(e.target.value)}
                    displayValue={(value: string) => value || 'No music selected'}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
                  <Combobox.Option 
                    value=""
                    className={({ active }) =>
                      `cursor-default select-none relative py-2 px-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                      }`
                    }
                  >
                    No music selected
                  </Combobox.Option>
                  {filteredBgMusicAssets.map((asset) => (
                    <Combobox.Option
                      key={asset}
                      value={asset}
                      className={({ active }) =>
                        `cursor-default select-none relative py-2 px-4 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {asset}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Box>
            
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Sound
              </label>
              <Combobox 
                value={editingLocationType.entrySound || ''}
                onChange={(value: string) => handleChange('entrySound', value)}
              >
                <div className="relative w-full">
                  <Combobox.Input
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    onChange={(e) => setEntrySoundSearchQuery(e.target.value)}
                    displayValue={(value: string) => value || 'No sound selected'}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
                  <Combobox.Option 
                    value=""
                    className={({ active }) =>
                      `cursor-default select-none relative py-2 px-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                      }`
                    }
                  >
                    No sound selected
                  </Combobox.Option>
                  {filteredEntrySoundAssets.map((asset) => (
                    <Combobox.Option
                      key={asset}
                      value={asset}
                      className={({ active }) =>
                        `cursor-default select-none relative py-2 px-4 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {asset}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Box>
            
            <Box className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connected Locations
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editingLocationType.connectedLocations || []).map(locationId => {
                  const connectedLocationType = locations.find(loc => loc.id === locationId);
                  return connectedLocationType ? (
                    <Chip 
                      key={locationId}
                      label={connectedLocationType.name}
                      onDelete={() => handleRemoveConnectedLocationType(locationId)}
                    />
                  ) : null;
                })}
              </div>
              <Combobox 
                value=""
                onChange={(locationId: string) => {
                  if (locationId) {
                    handleAddConnectedLocationType(locationId);
                  }
                }}
              >
                <div className="relative w-full">
                  <Combobox.Input
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    onChange={(e) => setConnectedLocationsSearchQuery(e.target.value)}
                    displayValue={() => ''}
                    placeholder="Search and add connected locations..."
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
                  {filteredConnectedLocations.length === 0 && (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                      No locations found.
                    </div>
                  )}
                  {filteredConnectedLocations.map((loc) => (
                    <Combobox.Option
                      key={loc.id}
                      value={loc.id}
                      className={({ active }) =>
                        `cursor-default select-none relative py-2 px-4 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {loc.name}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onPress={onClose} color="secondary">
          Cancel
        </Button>
        <Button onPress={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLocationDialog; 