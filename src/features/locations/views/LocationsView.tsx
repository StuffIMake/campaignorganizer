import React, { useState } from 'react';
import { 
  Button, 
  Paper, 
  Snackbar, 
  IconButton 
} from '../../../components/ui';
import { 
  AddIcon, 
  SaveIcon, 
  CloseIcon 
} from '../../../assets/icons';
import { LocationItem } from '../components/LocationItem';
import { LocationSearch } from '../components/LocationSearch';
import { LocationDescriptionDialog } from '../components/LocationDescriptionDialog';
import { LocationFormDialog } from '../components/LocationFormDialog';
import { useLocations, useLocationForm, useNotifications } from '../hooks';
import { CustomLocation } from '../../../store';

// Updating the interface for LocationFormData to match what's used in the hook
interface LocationFormData {
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
}

export const LocationsView: React.FC = () => {
  const { 
    locations,
    filteredLocations,
    filteredTopLevelLocations,
    getFilteredSublocationsByParentId,
    audioFiles,
    imageFiles,
    expandedLocations,
    searchQuery,
    setSearchQuery,
    toggleLocationExpand,
    addLocation,
    updateLocation,
    deleteLocation,
    saveData
  } = useLocations();

  const { 
    showNotification, 
    hideNotification, 
    snackbarOpen, 
    snackbarMessage 
  } = useNotifications();

  const {
    formData,
    handleChange,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingLocationId,
    imageSearchQuery,
    setImageSearchQuery,
    parentSearchQuery,
    setParentSearchQuery,
    connectedSearchQuery,
    setConnectedSearchQuery,
    bgMusicSearchQuery,
    setBgMusicSearchQuery,
    entrySoundSearchQuery,
    setEntrySoundSearchQuery,
    handleAddLocation,
    handleEditLocation,
    handleSaveLocation,
    resetForm
  } = useLocationForm(
    // Wrap addLocation to ensure required fields are present
    (locationData) => {
      // Ensure name field is always provided
      const data: Omit<CustomLocation, 'id'> = {
        name: locationData.name || 'New Location', // Provide a default name if undefined
        description: locationData.description || '',
        backgroundMusic: locationData.backgroundMusic,
        entrySound: locationData.entrySound,
        imageUrl: locationData.imageUrl,
        descriptionType: locationData.descriptionType || 'markdown',
        coordinates: locationData.coordinates || [0, 0],
        parentLocationId: locationData.parentLocationId,
        mixWithParent: locationData.mixWithParent || false,
        connectedLocations: locationData.connectedLocations
      };
      addLocation(data);
      showNotification('Location added successfully');
    },
    (id, locationData) => {
      updateLocation(id, locationData);
      showNotification('Location updated successfully');
    }
  );

  // Location description dialog state
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [viewingLocationDescription, setViewingLocationDescription] = useState<string>("");
  const [viewingLocationName, setViewingLocationName] = useState<string>("");
  const [viewingDescriptionType, setViewingDescriptionType] = useState<'markdown' | 'image' | 'pdf'>('markdown');

  const handleViewDescription = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setViewingLocationName(location.name);
      setViewingLocationDescription(location.description);
      setViewingDescriptionType(location.descriptionType || 'markdown');
      setShowDescriptionDialog(true);
    }
  };

  const handleDeleteLocation = (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      deleteLocation(locationId);
      showNotification('Location deleted successfully');
    }
  };

  const handleSaveData = async () => {
    const result = await saveData();
    showNotification(result.message);
  };

  const renderLocationTree = (locationId: string, level = 0): React.ReactNode => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return null;
    
    const sublocations = getFilteredSublocationsByParentId(locationId);
    const isExpanded = expandedLocations[locationId] || false;
    
    return (
      <LocationItem
        key={locationId}
        location={location}
        level={level}
        isExpanded={isExpanded}
        onToggleExpand={toggleLocationExpand}
        onEdit={handleEditLocation}
        onDelete={handleDeleteLocation}
        onViewDescription={handleViewDescription}
        childLocations={
          sublocations.length > 0 && isExpanded && (
            <div className="ml-4">
              {sublocations.map(subloc => renderLocationTree(subloc.id, level + 1))}
            </div>
          )
        }
      />
    );
  };

  // Cast handleChange to the expected type for the form dialog
  const handleFormChange = (field: string, value: any) => {
    handleChange(field as keyof LocationFormData, value);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Locations</h1>
        <div>
          <Button 
            startIcon={<AddIcon />}
            variant="contained" 
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
            className="mr-2"
          >
            Add Location
          </Button>
          <Button 
            startIcon={<SaveIcon />}
            variant="outlined"
            onClick={handleSaveData}
          >
            Save Data
          </Button>
        </div>
      </div>

      <LocationSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Paper className="p-4">
        {filteredTopLevelLocations.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-500">No locations found. Create a new location to get started.</p>
          </div>
        ) : (
          filteredTopLevelLocations.map(location => renderLocationTree(location.id))
        )}
      </Paper>

      {/* Add Location Dialog */}
      <LocationFormDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          resetForm();
        }}
        title="Add New Location"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleAddLocation}
        locations={locations}
        audioFiles={audioFiles}
        imageFiles={imageFiles}
        imageSearchQuery={imageSearchQuery}
        setImageSearchQuery={setImageSearchQuery}
        parentSearchQuery={parentSearchQuery}
        setParentSearchQuery={setParentSearchQuery}
        connectedSearchQuery={connectedSearchQuery}
        setConnectedSearchQuery={setConnectedSearchQuery}
        bgMusicSearchQuery={bgMusicSearchQuery}
        setBgMusicSearchQuery={setBgMusicSearchQuery}
        entrySoundSearchQuery={entrySoundSearchQuery}
        setEntrySoundSearchQuery={setEntrySoundSearchQuery}
      />

      {/* Edit Location Dialog */}
      <LocationFormDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          resetForm();
        }}
        title="Edit Location"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSaveLocation}
        locations={locations}
        audioFiles={audioFiles}
        imageFiles={imageFiles}
        imageSearchQuery={imageSearchQuery}
        setImageSearchQuery={setImageSearchQuery}
        parentSearchQuery={parentSearchQuery}
        setParentSearchQuery={setParentSearchQuery}
        connectedSearchQuery={connectedSearchQuery}
        setConnectedSearchQuery={setConnectedSearchQuery}
        bgMusicSearchQuery={bgMusicSearchQuery}
        setBgMusicSearchQuery={setBgMusicSearchQuery}
        entrySoundSearchQuery={entrySoundSearchQuery}
        setEntrySoundSearchQuery={setEntrySoundSearchQuery}
      />

      {/* Location Description Dialog */}
      <LocationDescriptionDialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
        locationName={viewingLocationName}
        description={viewingLocationDescription}
        descriptionType={viewingDescriptionType}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={hideNotification}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="default"  // Changed from "inherit" to "default"
            onClick={hideNotification}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </div>
  );
}; 