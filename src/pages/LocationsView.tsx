import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { CustomLocation } from '../store';
import { AssetManager } from '../services/assetManager';
import { AudioTrackPanel } from '../components/AudioTrackPanel';
import MarkdownContent from '../components/MarkdownContent';
import { 
  Autocomplete,
  Box, 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  Chip, 
  Collapse,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider, 
  FormControl, 
  FormControlLabel,
  Grid, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  MenuItem,
  Paper, 
  Select, 
  Snackbar, 
  Stack,
  Switch, 
  Tab, 
  Tabs, 
  TextField, 
  Tooltip, 
  Typography 
} from '../components/ui';
import {
  MusicNoteIcon,
  VolumeUpIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ExpandMoreIcon,
  ExpandLessIcon,
  SaveIcon,
  SearchIcon,
  ClearIcon,
  CloseIcon,
  HelpIcon,
  CodeIcon
} from '../assets/icons';

export const LocationsView: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    backgroundMusic: '',
    entrySound: '',
    imageUrl: '',
    descriptionType: 'markdown' as 'markdown' | 'image' | 'pdf',
    parentLocationId: '',
    coordinates: [0, 0] as [number | string, number | string],
    mixWithParent: false,
    connectedLocations: [] as string[]
  });
  
  // Currently edited location
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  
  // Available audio files
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  
  // Available image files
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  
  // Status for save operation
  const [isSaving, setIsSaving] = useState(false);
  
  // Expanded locations state
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});

  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [viewingLocationDescription, setViewingLocationDescription] = useState<string>("");
  const [viewingLocationName, setViewingLocationName] = useState<string>("");

  const { 
    locations, 
    addLocation, 
    updateLocation,
    deleteLocation, 
    getAllTopLevelLocations, 
    getSublocationsByParentId, 
    saveDataToIndexedDB 
  } = useStore();
  
  // Apply search filter to all locations
  const filteredLocations = React.useMemo(() => {
    if (!searchQuery.trim()) return locations;
    
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return locations.filter(location => {
      // Search in various location fields
      const searchableFields = [
        location.name.toLowerCase(),
        location.description.toLowerCase(),
        location.backgroundMusic?.toLowerCase() || '',
        location.entrySound?.toLowerCase() || '',
        location.imageUrl?.toLowerCase() || '',
      ];
      
      // Connect to parent location names
      if (location.parentLocationId) {
        const parentLocation = locations.find(loc => loc.id === location.parentLocationId);
        if (parentLocation) {
          searchableFields.push(parentLocation.name.toLowerCase());
        }
      }
      
      // Connected locations
      if (location.connectedLocations && location.connectedLocations.length > 0) {
        location.connectedLocations.forEach(connectedId => {
          const connectedLocation = locations.find(loc => loc.id === connectedId);
          if (connectedLocation) {
            searchableFields.push(connectedLocation.name.toLowerCase());
          }
        });
      }
      
      // Check if any search term matches any field
      return searchTerms.some(term => 
        searchableFields.some(field => field.includes(term))
      );
    });
  }, [locations, searchQuery]);
  
  // Filter top level locations based on search results
  const filteredTopLevelLocations = React.useMemo(() => {
    if (!searchQuery.trim()) return getAllTopLevelLocations();
    
    // If searching, show all matching locations at top level for easier discovery
    return filteredLocations.filter(location => !location.parentLocationId);
  }, [filteredLocations, getAllTopLevelLocations, searchQuery]);
  
  // Get sublocation function that respects search filter
  const getFilteredSublocationsByParentId = (parentId: string) => {
    if (!searchQuery.trim()) {
      return getSublocationsByParentId(parentId);
    } else {
      return filteredLocations.filter(loc => loc.parentLocationId === parentId);
    }
  };
  
  // Load audio files on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const audioAssets = await AssetManager.getAssets('audio');
        setAudioFiles(audioAssets.map(asset => asset.name));
        
        const imageAssets = await AssetManager.getAssets('images');
        setImageFiles(imageAssets.map(asset => asset.name));
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };
    
    loadAssets();
  }, []);

  const handleAddLocation = () => {
    addLocation({
      name: newLocation.name,
      description: newLocation.description,
      backgroundMusic: newLocation.backgroundMusic || undefined,
      entrySound: newLocation.entrySound || undefined,
      imageUrl: newLocation.imageUrl || undefined,
      descriptionType: newLocation.descriptionType,
      coordinates: typeof newLocation.coordinates[0] === 'number' && typeof newLocation.coordinates[1] === 'number' 
        ? newLocation.coordinates as [number, number] 
        : [0, 0],
      parentLocationId: newLocation.parentLocationId || undefined,
      mixWithParent: newLocation.mixWithParent,
      connectedLocations: newLocation.connectedLocations.length > 0 ? newLocation.connectedLocations : undefined
    });
    
    setIsAddDialogOpen(false);
    resetNewLocationForm();
    showSnackbar('Location added successfully');
  };
  
  const resetNewLocationForm = () => {
    setNewLocation({ 
      name: '', 
      description: '', 
      backgroundMusic: '', 
      entrySound: '',
      imageUrl: '',
      descriptionType: 'markdown' as 'markdown' | 'image' | 'pdf',
      parentLocationId: '',
      coordinates: [0, 0] as [number | string, number | string],
      mixWithParent: false,
      connectedLocations: []
    });
  };

  const toggleLocationExpand = (locationId: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };
  
  // Open edit dialog for a location
  const handleEditLocation = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setEditingLocation(locationId);
      setNewLocation({
        name: location.name,
        description: location.description,
        backgroundMusic: location.backgroundMusic || '',
        entrySound: location.entrySound || '',
        imageUrl: location.imageUrl || '',
        descriptionType: location.descriptionType || 'markdown',
        parentLocationId: location.parentLocationId || '',
        coordinates: location.coordinates || [0, 0] as [number | string, number | string],
        mixWithParent: location.mixWithParent || false,
        connectedLocations: location.connectedLocations || []
      });
      setIsEditDialogOpen(true);
    }
  };
  
  // Save edited location
  const handleSaveLocation = () => {
    if (editingLocation) {
      updateLocation(editingLocation, {
        name: newLocation.name,
        description: newLocation.description,
        backgroundMusic: newLocation.backgroundMusic || undefined,
        entrySound: newLocation.entrySound || undefined,
        imageUrl: newLocation.imageUrl || undefined,
        descriptionType: newLocation.descriptionType,
        coordinates: typeof newLocation.coordinates[0] === 'number' && typeof newLocation.coordinates[1] === 'number' 
          ? newLocation.coordinates as [number, number] 
          : [0, 0],
        parentLocationId: newLocation.parentLocationId || undefined,
        mixWithParent: newLocation.mixWithParent,
        connectedLocations: newLocation.connectedLocations.length > 0 ? newLocation.connectedLocations : undefined
      });
      
      setIsEditDialogOpen(false);
      resetNewLocationForm();
      setEditingLocation(null);
      showSnackbar('Location updated successfully');
    }
  };
  
  // Confirm and delete a location
  const handleDeleteLocation = (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location? This cannot be undone.')) {
      deleteLocation(locationId);
      showSnackbar('Location deleted successfully');
    }
  };
  
  // Save all data to IndexedDB
  const handleSaveData = async () => {
    setIsSaving(true);
    try {
      const result = await saveDataToIndexedDB();
      showSnackbar(result.message);
    } catch (error) {
      showSnackbar(`Error saving data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show a snackbar message
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Recursive function to render location with nested structure
  const renderLocation = (location: CustomLocation, level = 0) => {
    const sublocations = getFilteredSublocationsByParentId(location.id);
    const hasSublocations = sublocations.length > 0;
    const isExpanded = expandedLocations[location.id] || false;
    
    return (
      <div key={location.id} className="relative">
        <div className={`
          flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50
          ${level > 0 ? 'pl-' + (level * 6 + 4) + ' border-l-2 border-slate-100 dark:border-slate-800' : ''}
        `}>
          {hasSublocations && (
            <button
              onClick={() => toggleLocationExpand(location.id)}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 mr-2 transition-colors"
            >
              {isExpanded ? (
                <ExpandLessIcon className="h-5 w-5 text-slate-500" />
              ) : (
                <ExpandMoreIcon className="h-5 w-5 text-slate-500" />
              )}
            </button>
          )}
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center">
              <h3 className="text-base font-medium text-slate-900 dark:text-white truncate">{location.name}</h3>
              
              {location.backgroundMusic && (
                <Tooltip title={`Background Music: ${location.backgroundMusic}`}>
                  <div className="ml-2 text-slate-400">
                    <MusicNoteIcon className="h-4 w-4" />
                  </div>
                </Tooltip>
              )}
              
              {location.entrySound && (
                <Tooltip title={`Entry Sound: ${location.entrySound}`}>
                  <div className="ml-2 text-slate-400">
                    <VolumeUpIcon className="h-4 w-4" />
                  </div>
                </Tooltip>
              )}
            </div>
            
            {location.description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {location.descriptionType === 'markdown' ? 
                  location.description.replace(/[#*`]/g, '') : 
                  location.descriptionType === 'image' ? 'Image description' : 'PDF document'
                }
              </p>
            )}
            
            {location.connectedLocations && location.connectedLocations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {location.connectedLocations.map(connId => {
                  const connLoc = locations.find(l => l.id === connId);
                  return connLoc ? (
                    <Chip 
                      key={connId} 
                      label={connLoc.name} 
                      size="small"
                      variant="outlined"
                      color="primary"
                      className="text-xs"
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center ml-4 space-x-1">
            {location.description && location.descriptionType === 'markdown' && (
              <Tooltip title="View Description">
                <IconButton
                  onClick={() => {
                    setViewingLocationDescription(location.description);
                    setViewingLocationName(location.name);
                    setShowDescriptionDialog(true);
                  }}
                  size="small"
                >
                  <CodeIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Edit Location">
              <IconButton
                onClick={() => handleEditLocation(location.id)}
                size="small"
              >
                <EditIcon className="h-5 w-5" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete Location">
              <IconButton
                onClick={() => handleDeleteLocation(location.id)}
                size="small"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <DeleteIcon className="h-5 w-5" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        
        {hasSublocations && isExpanded && (
          <div className="border-l-2 border-slate-100 dark:border-slate-800 ml-10">
            {sublocations.map(sublocation => renderLocation(sublocation, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Main render section
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Locations</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <ClearIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            variant="primary"
            startIcon={<AddIcon />}
          >
            Add Location
          </Button>
          
          <Button
            onClick={handleSaveData}
            variant="outline"
            color="primary"
            startIcon={<SaveIcon />}
            isLoading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
      
      {/* Locations List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Empty state */}
        {filteredTopLevelLocations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No locations found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              {searchQuery 
                ? "No locations match your search criteria. Try adjusting your search terms."
                : "Start building your world by adding your first location."}
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="primary"
              startIcon={<AddIcon />}
            >
              Add First Location
            </Button>
          </div>
        )}
        
        {/* Location list */}
        {filteredTopLevelLocations.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTopLevelLocations.map(location => renderLocation(location))}
          </div>
        )}
      </div>
      
      {/* Add Location Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        aria-labelledby="add-location-title"
      >
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                autoFocus
                label="Location Name"
                fullWidth
                value={newLocation.name}
                onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-2">
              <FormControl fullWidth>
                <InputLabel>Description Type</InputLabel>
                <Select
                  value={newLocation.descriptionType}
                  onChange={(e) => setNewLocation({...newLocation, descriptionType: e.target.value as 'markdown' | 'image' | 'pdf'})}
                >
                  <MenuItem value="markdown">Markdown Text</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="pdf">PDF Document</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className="sm:col-span-2">
              {newLocation.descriptionType === 'markdown' ? (
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                />
              ) : newLocation.descriptionType === 'image' ? (
                <FormControl fullWidth>
                  <InputLabel>Image</InputLabel>
                  <Select
                    value={newLocation.imageUrl}
                    onChange={(e) => setNewLocation({...newLocation, imageUrl: e.target.value as string})}
                  >
                    {imageFiles.map(file => (
                      <MenuItem key={file} value={file}>{file}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>PDF Document</InputLabel>
                  <Select
                    value={newLocation.description}
                    onChange={(e) => setNewLocation({...newLocation, description: e.target.value as string})}
                  >
                    <MenuItem value="">Select a PDF</MenuItem>
                  </Select>
                </FormControl>
              )}
            </div>
            
            <FormControl fullWidth>
              <InputLabel>Parent Location</InputLabel>
              <Select
                value={newLocation.parentLocationId}
                onChange={(e) => setNewLocation({...newLocation, parentLocationId: e.target.value as string})}
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {locations.map(loc => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Background Music</InputLabel>
              <Select
                value={newLocation.backgroundMusic}
                onChange={(e) => setNewLocation({...newLocation, backgroundMusic: e.target.value as string})}
              >
                <MenuItem value="">None</MenuItem>
                {audioFiles.map(file => (
                  <MenuItem key={file} value={file}>{file}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Entry Sound</InputLabel>
              <Select
                value={newLocation.entrySound}
                onChange={(e) => setNewLocation({...newLocation, entrySound: e.target.value as string})}
              >
                <MenuItem value="">None</MenuItem>
                {audioFiles.map(file => (
                  <MenuItem key={file} value={file}>{file}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={newLocation.mixWithParent}
                  onChange={(e) => setNewLocation({...newLocation, mixWithParent: e.target.checked})}
                />
              }
              label="Mix audio with parent location"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} variant="text">
            Cancel
          </Button>
          <Button 
            onClick={handleAddLocation} 
            variant="primary"
            disabled={!newLocation.name.trim()}
          >
            Add Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Location Dialog - fix DialogTitle */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        aria-labelledby="edit-location-title"
      >
        <DialogTitle>Edit Location</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                autoFocus
                label="Location Name"
                fullWidth
                value={newLocation.name}
                onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-2">
              <FormControl fullWidth>
                <InputLabel>Description Type</InputLabel>
                <Select
                  value={newLocation.descriptionType}
                  onChange={(e) => setNewLocation({...newLocation, descriptionType: e.target.value as 'markdown' | 'image' | 'pdf'})}
                >
                  <MenuItem value="markdown">Markdown Text</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="pdf">PDF Document</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className="sm:col-span-2">
              {newLocation.descriptionType === 'markdown' ? (
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                />
              ) : newLocation.descriptionType === 'image' ? (
                <FormControl fullWidth>
                  <InputLabel>Image</InputLabel>
                  <Select
                    value={newLocation.imageUrl}
                    onChange={(e) => setNewLocation({...newLocation, imageUrl: e.target.value as string})}
                  >
                    {imageFiles.map(file => (
                      <MenuItem key={file} value={file}>{file}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>PDF Document</InputLabel>
                  <Select
                    value={newLocation.description}
                    onChange={(e) => setNewLocation({...newLocation, description: e.target.value as string})}
                  >
                    <MenuItem value="">Select a PDF</MenuItem>
                  </Select>
                </FormControl>
              )}
            </div>
            
            <FormControl fullWidth>
              <InputLabel>Parent Location</InputLabel>
              <Select
                value={newLocation.parentLocationId}
                onChange={(e) => setNewLocation({...newLocation, parentLocationId: e.target.value as string})}
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {locations.map(loc => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Background Music</InputLabel>
              <Select
                value={newLocation.backgroundMusic}
                onChange={(e) => setNewLocation({...newLocation, backgroundMusic: e.target.value as string})}
              >
                <MenuItem value="">None</MenuItem>
                {audioFiles.map(file => (
                  <MenuItem key={file} value={file}>{file}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Entry Sound</InputLabel>
              <Select
                value={newLocation.entrySound}
                onChange={(e) => setNewLocation({...newLocation, entrySound: e.target.value as string})}
              >
                <MenuItem value="">None</MenuItem>
                {audioFiles.map(file => (
                  <MenuItem key={file} value={file}>{file}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={newLocation.mixWithParent}
                  onChange={(e) => setNewLocation({...newLocation, mixWithParent: e.target.checked})}
                />
              }
              label="Mix audio with parent location"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} variant="text">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveLocation} 
            variant="primary"
            disabled={!newLocation.name.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Description Dialog - fix DialogTitle */}
      <Dialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
        aria-labelledby="view-description-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{viewingLocationName}</DialogTitle>
        <DialogContent>
          <MarkdownContent content={viewingLocationDescription} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDescriptionDialog(false)} variant="text">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
}; 