import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Box,
  Autocomplete,
  Chip
} from '../../../components/ui';
import { SearchIcon, ClearIcon } from '../../../assets/icons';
import { CustomLocation } from '../../../store';

interface LocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formData: {
    name: string;
    description: string;
    backgroundMusic: string;
    entrySound: string;
    imageUrl: string;
    descriptionType: 'markdown' | 'image' | 'pdf';
    parentLocationId: string;
    coordinates: [number | string, number | string];
    mixWithParent: boolean;
    connectedLocations: string[];
  };
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  locations: CustomLocation[];
  audioFiles: string[];
  imageFiles: string[];
  imageSearchQuery: string;
  setImageSearchQuery: (query: string) => void;
  parentSearchQuery: string;
  setParentSearchQuery: (query: string) => void;
  connectedSearchQuery: string;
  setConnectedSearchQuery: (query: string) => void;
  bgMusicSearchQuery: string;
  setBgMusicSearchQuery: (query: string) => void;
  entrySoundSearchQuery: string;
  setEntrySoundSearchQuery: (query: string) => void;
}

export const LocationFormDialog: React.FC<LocationFormDialogProps> = ({
  open,
  onClose,
  title,
  formData,
  onChange,
  onSubmit,
  locations,
  audioFiles,
  imageFiles,
  imageSearchQuery,
  setImageSearchQuery,
  parentSearchQuery,
  setParentSearchQuery,
  connectedSearchQuery,
  setConnectedSearchQuery,
  bgMusicSearchQuery,
  setBgMusicSearchQuery,
  entrySoundSearchQuery,
  setEntrySoundSearchQuery
}) => {
  const handleSubmit = () => {
    onSubmit();
  };

  // Get selected connected locations
  const selectedConnectedLocations = locations.filter(loc => 
    formData.connectedLocations.includes(loc.id)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(value) => onChange('name', value)}
              isRequired
            />
            
            <TextField 
              name="description"
              value={formData.description}
              onChange={(value) => onChange('description', value)}
              fullWidth
              aria-label="Location description"
              className="mb-4"
              InputProps={{
                inputProps: {
                  style: { minHeight: '100px' }
                }
              }}
            />
            
            <TextField
              fullWidth
              label="X Coordinate"
              value={formData.coordinates[0]?.toString() || ''}
              onChange={(value) => {
                // Allow numbers, decimal point, minus sign
                if (/^-?\d*\.?\d*$/.test(value) || value === '') {
                  onChange('coordinates', [value === '' ? 0 : value, formData.coordinates[1]]);
                }
              }}
              aria-label="X Coordinate"
              InputProps={{
                inputProps: { 
                  type: "text",
                  inputMode: "decimal",
                  pattern: "[0-9]*[.]?[0-9]*" 
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Y Coordinate"
              value={formData.coordinates[1]?.toString() || ''}
              onChange={(value) => {
                // Allow numbers, decimal point, minus sign
                if (/^-?\d*\.?\d*$/.test(value) || value === '') {
                  onChange('coordinates', [formData.coordinates[0], value === '' ? 0 : value]);
                }
              }}
              aria-label="Y Coordinate"
              InputProps={{
                inputProps: { 
                  type: "text",
                  inputMode: "decimal",
                  pattern: "[0-9]*[.]?[0-9]*" 
                }
              }}
            />
            
            {/* Parent Location Autocomplete */}
            <Autocomplete<CustomLocation | null>
              options={locations}
              getOptionLabel={(option: CustomLocation | null) => option?.name || ''}
              value={locations.find(loc => loc.id === formData.parentLocationId) || null}
              onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: CustomLocation | null) => {
                onChange('parentLocationId', selectedOption?.id || '');
              }}
              isOptionEqualToValue={(option: CustomLocation | null, value: CustomLocation | null) => option?.id === value?.id}
              renderInput={(params: any) => (
                <TextField 
                  {...params}
                  label="Parent Location"
                  placeholder="Select a parent location" 
                  fullWidth
                />
              )}
            />
            
            {/* Simplified mixWithParent toggle */}
            <div className="flex items-center mt-2 mb-4">
              <input
                type="checkbox"
                id="mixWithParent"
                checked={formData.mixWithParent}
                onChange={(e) => {
                  console.log("Direct checkbox toggled:", e.target.checked);
                  onChange('mixWithParent', e.target.checked);
                }}
                className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="mixWithParent" className="ml-2 text-sm font-medium">
                Mix with parent location audio
              </label>
            </div>
            
            {/* Background Music Autocomplete - Enhanced to prevent hover issues */}
            <Autocomplete<string | null>
              options={audioFiles}
              getOptionLabel={(option: string | null) => option || ''}
              value={formData.backgroundMusic || null}
              onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
                console.log('BGM selected:', selectedOption);
                onChange('backgroundMusic', selectedOption || '');
              }}
              isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
              renderInput={(params: any) => (
                <TextField 
                  {...params}
                  label="Background Music"
                  placeholder="Select background music" 
                  fullWidth
                  // Add input name for debugging
                  name="bgm-autocomplete-input"
                />
              )}
            />
            
            {/* Entry Sound Autocomplete */}
            <Autocomplete<string | null>
              options={audioFiles}
              getOptionLabel={(option: string | null) => option || ''}
              value={formData.entrySound || null}
              onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
                onChange('entrySound', selectedOption || '');
              }}
              isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
              renderInput={(params: any) => (
                <TextField 
                  {...params}
                  label="Entry Sound"
                  placeholder="Select entry sound" 
                  fullWidth
                />
              )}
            />
            
            {/* Image URL Autocomplete */}
            <Autocomplete<string | null>
              options={imageFiles}
              getOptionLabel={(option: string | null) => option || ''}
              value={formData.imageUrl || null}
              onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
                onChange('imageUrl', selectedOption || '');
              }}
              isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
              renderInput={(params: any) => (
                <TextField 
                  {...params}
                  label="Image URL"
                  placeholder="Select an image" 
                  fullWidth
                />
              )}
            />
            
            {/* Connected Locations Autocomplete - Multiple Selection */}
            <Autocomplete
              multiple
              options={locations.filter(loc => loc.id !== formData.parentLocationId)}
              getOptionLabel={(option: CustomLocation) => option.name}
              value={selectedConnectedLocations}
              onChange={(_event: React.ChangeEvent<{}> | null, selectedOptions: CustomLocation[]) => {
                onChange('connectedLocations', selectedOptions.map(opt => opt.id));
              }}
              isOptionEqualToValue={(option: CustomLocation, value: CustomLocation) => option.id === value.id}
              renderInput={(params: any) => (
                <TextField 
                  {...params}
                  label="Connected Locations"
                  placeholder="Select connected locations" 
                  fullWidth
                />
              )}
              renderTags={(tagValue: CustomLocation[], getTagProps) =>
                tagValue.map((option: CustomLocation, index: number) => (
                  <Chip 
                    label={option.name} 
                    {...getTagProps({ index })} 
                    key={option.id}
                  />
                ))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onPress={onClose}>Cancel</Button>
          <Button 
            onPress={handleSubmit} 
            isDisabled={!formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 