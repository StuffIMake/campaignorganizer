import React from 'react';
import { Combobox } from '@headlessui/react';
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
  InputAdornment
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const filteredImageFiles = imageSearchQuery === ''
    ? imageFiles
    : imageFiles.filter(file =>
        file.toLowerCase().includes(imageSearchQuery.toLowerCase())
      );

  const filteredAudioFiles = {
    bgMusic: bgMusicSearchQuery === ''
      ? audioFiles
      : audioFiles.filter(file =>
          file.toLowerCase().includes(bgMusicSearchQuery.toLowerCase())
        ),
    entrySound: entrySoundSearchQuery === ''
      ? audioFiles
      : audioFiles.filter(file =>
          file.toLowerCase().includes(entrySoundSearchQuery.toLowerCase())
        )
  };

  const filteredLocations = {
    parent: parentSearchQuery === ''
      ? locations
      : locations.filter(location =>
          location.name.toLowerCase().includes(parentSearchQuery.toLowerCase())
        ),
    connected: connectedSearchQuery === ''
      ? locations
      : locations.filter(location =>
          location.name.toLowerCase().includes(connectedSearchQuery.toLowerCase())
        )
  };

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
          <Grid container spacing={2} className="mt-2">
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                value={formData.description}
                onChange={(e) => onChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="X Coordinate"
                type="number"
                fullWidth
                value={formData.coordinates[0]}
                onChange={(e) => onChange('coordinates', [parseFloat(e.target.value), formData.coordinates[1]])}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Y Coordinate"
                type="number"
                fullWidth
                value={formData.coordinates[1]}
                onChange={(e) => onChange('coordinates', [formData.coordinates[0], parseFloat(e.target.value)])}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Combobox value={formData.parentLocationId} onChange={(value) => onChange('parentLocationId', value)}>
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full border rounded p-2"
                    placeholder="Parent Location"
                    displayValue={(locationId: string) => {
                      if (!locationId) return '';
                      const location = locations.find(loc => loc.id === locationId);
                      return location ? location.name : '';
                    }}
                    onChange={(e) => setParentSearchQuery(e.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 shadow-lg z-10">
                    {filteredLocations.parent.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredLocations.parent.map(location => (
                        <Combobox.Option
                          key={location.id}
                          value={location.id}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {location.name}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.mixWithParent}
                    onChange={(e) => onChange('mixWithParent', e.target.checked)}
                  />
                }
                label="Mix with parent location audio"
              />
            </Grid>
            
            {/* Background Music */}
            <Grid item xs={12}>
              <Combobox value={formData.backgroundMusic} onChange={(value) => onChange('backgroundMusic', value)}>
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full border rounded p-2"
                    placeholder="Background Music"
                    displayValue={(file: string) => file}
                    onChange={(e) => setBgMusicSearchQuery(e.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 shadow-lg z-10">
                    {filteredAudioFiles.bgMusic.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredAudioFiles.bgMusic.map(file => (
                        <Combobox.Option
                          key={file}
                          value={file}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {file}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </Grid>
            
            {/* Entry Sound */}
            <Grid item xs={12}>
              <Combobox value={formData.entrySound} onChange={(value) => onChange('entrySound', value)}>
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full border rounded p-2"
                    placeholder="Entry Sound"
                    displayValue={(file: string) => file}
                    onChange={(e) => setEntrySoundSearchQuery(e.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 shadow-lg z-10">
                    {filteredAudioFiles.entrySound.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredAudioFiles.entrySound.map(file => (
                        <Combobox.Option
                          key={file}
                          value={file}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {file}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </Grid>
            
            {/* Image URL */}
            <Grid item xs={12}>
              <Combobox value={formData.imageUrl} onChange={(value) => onChange('imageUrl', value)}>
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full border rounded p-2"
                    placeholder="Image URL"
                    displayValue={(file: string) => file}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 shadow-lg z-10">
                    {filteredImageFiles.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredImageFiles.map(file => (
                        <Combobox.Option
                          key={file}
                          value={file}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {file}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 