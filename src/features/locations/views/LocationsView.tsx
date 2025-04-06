import React, { useState, Fragment } from 'react';
import { 
  Button, 
  Paper, 
  Snackbar, 
  IconButton,
  Typography
} from '../../../components/ui';
import { 
  AddIcon, 
  SaveIcon, 
  CloseIcon, 
  SearchIcon,
  ExpandLessIcon,
  ExpandMoreIcon as FormatListBulletedIcon,
  MenuIcon as FilterIcon,
  PlaceIcon,
} from '../../../assets/icons';
import { LocationItem } from '../components/LocationItem';
import { LocationSearch } from '../components/LocationSearch';
import { LocationDescriptionDialog } from '../components/LocationDescriptionDialog';
import { LocationFormDialog } from '../components/LocationFormDialog';
import { useLocations, useLocationForm, useNotifications } from '../hooks';
import { CustomLocation } from '../../../store';

// Function to get sublocations - declare here to avoid errors
const getFilteredSublocationsByParentId = (parentId: string) => [];

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

  // View options state
  const [isGridView, setIsGridView] = useState(false);

  // Add a state for current parent in grid view
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Add a state to track when search is active
  const [isSearchActive, setIsSearchActive] = useState(false);

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

  const handleToggleExpand = (locationId: string) => {
    if (isGridView) {
      // In grid view, set this as current parent to show only its children
      setCurrentParentId(locationId);
    } else {
      // In tree view, use the standard expand/collapse
      toggleLocationExpand(locationId);
    }
  };

  const handleNavigateUp = () => {
    // Find current parent location
    const currentParent = currentParentId 
      ? locations.find(loc => loc.id === currentParentId) 
      : null;
    
    // Navigate to grandparent or back to root
    setCurrentParentId(currentParent?.parentLocationId || null);
  };

  const renderLocationTree = (locationId: string, level = 0): React.ReactNode => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return null;
    
    const sublocations = getFilteredSublocationsByParentId(locationId);
    const isExpanded = expandedLocations[locationId] || false;
    const hasChildren = sublocations.length > 0;
    
    return (
      <Fragment key={locationId}>
        <LocationItem
          location={location}
          level={level}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onToggleExpand={toggleLocationExpand}
          onEdit={handleEditLocation}
          onDelete={handleDeleteLocation}
          onViewDescription={handleViewDescription}
          gridView={isGridView}
        />
        {hasChildren && isExpanded && (
          <div className={isGridView ? "pl-3" : "pl-5"}>
            {sublocations.map(subloc => renderLocationTree(subloc.id, level + 1))}
          </div>
        )}
      </Fragment>
    );
  };

  const renderGrid = () => {
    let locationsToDisplay: CustomLocation[] = [];
    let currentParent: CustomLocation | null = null;
    
    if (currentParentId) {
      // Show children of current parent
      currentParent = locations.find(loc => loc.id === currentParentId) || null;
      locationsToDisplay = getFilteredSublocationsByParentId(currentParentId);
    } else {
      // Show filtered top level locations
      locationsToDisplay = filteredTopLevelLocations;
    }
    
    // If no locations found at this level, show a message
    if (locationsToDisplay.length === 0) {
      return (
        <div className="text-center py-12">
          {currentParent ? (
            <>
              <p className="text-text-secondary text-lg mb-6">No sublocations found for {currentParent.name}.</p>
              <Button
                variant="contained"
                color="primary"
                onPress={() => {
                  handleEditLocation(currentParent!);
                  setIsAddDialogOpen(true);
                  // Pre-fill parent ID
                  handleChange('parentLocationId', currentParent!.id);
                }}
                className="mr-4"
              >
                Add Sublocation
              </Button>
              <Button
                variant="outlined"
                onPress={handleNavigateUp}
              >
                Back to {currentParent.parentLocationId ? 'Parent' : 'All Locations'}
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-background-surface flex items-center justify-center">
                <PlaceIcon className="text-4xl text-text-secondary" />
              </div>
              <p className="text-text-secondary text-lg mb-6">No locations found. Create your first location to get started.</p>
              <Button
                variant="contained"
                color="primary"
                onPress={() => setIsAddDialogOpen(true)}
                className="btn-glow"
              >
                Create Location
              </Button>
            </>
          )}
        </div>
      );
    }
    
    return (
      <>
        {/* Breadcrumb navigation */}
        {currentParent && (
          <div className="mb-4 p-3 glass-effect rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <IconButton 
                className="mr-2 text-primary-light"
                onClick={handleNavigateUp}
              >
                <ExpandLessIcon />
              </IconButton>
              <div>
                <Typography variant="body2" className="text-text-secondary">
                  Current Location
                </Typography>
                <Typography variant="h6" className="font-display font-bold text-primary-light">
                  {currentParent.name}
                </Typography>
              </div>
            </div>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onPress={() => {
                setIsAddDialogOpen(true);
                // Pre-fill parent ID
                handleChange('parentLocationId', currentParent.id);
              }}
            >
              Add Sublocation
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {locationsToDisplay.map(location => {
            const sublocations = getFilteredSublocationsByParentId(location.id);
            const hasChildren = sublocations.length > 0;
            const parentLocation = location.parentLocationId 
              ? locations.find(loc => loc.id === location.parentLocationId) 
              : null;
              
            return (
              <LocationItem
                key={location.id}
                location={location}
                level={0} // No indent in grid view
                isExpanded={false} // Always false in grid view since we're using a different model
                hasChildren={hasChildren}
                onToggleExpand={handleToggleExpand}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onViewDescription={handleViewDescription}
                gridView={true}
                parentLocation={parentLocation}
              />
            );
          })}
        </div>
      </>
    );
  };

  // Update search query handler to enable flat search view
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Set search as active if there's text in the search box
    setIsSearchActive(query.length > 0);
    
    // When starting to search, reset the current parent if in grid view
    if (query.length > 0 && isGridView) {
      setCurrentParentId(null);
    }
  };

  // Add a function to render search results in a flat view
  const renderSearchResults = () => {
    if (!isSearchActive || filteredLocations.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">No locations match your search.</p>
        </div>
      );
    }

    if (isGridView) {
      // Render grid-style search results
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLocations.map(location => {
            const sublocations = getFilteredSublocationsByParentId(location.id);
            const hasChildren = sublocations.length > 0;
            const parentLocation = location.parentLocationId 
              ? locations.find(loc => loc.id === location.parentLocationId) 
              : null;
              
            return (
              <LocationItem
                key={location.id}
                location={location}
                level={0}
                isExpanded={false}
                hasChildren={hasChildren}
                onToggleExpand={handleToggleExpand}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onViewDescription={handleViewDescription}
                gridView={true}
                parentLocation={parentLocation}
              />
            );
          })}
        </div>
      );
    } else {
      // Render list-style search results
      return (
        <div className="space-y-2">
          {filteredLocations.map(location => {
            const sublocations = getFilteredSublocationsByParentId(location.id);
            const hasChildren = sublocations.length > 0;
            const parentLocation = location.parentLocationId 
              ? locations.find(loc => loc.id === location.parentLocationId) 
              : null;
              
            return (
              <LocationItem
                key={location.id}
                location={location}
                level={0}
                isExpanded={false}
                hasChildren={hasChildren}
                onToggleExpand={toggleLocationExpand}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onViewDescription={handleViewDescription}
                gridView={false}
                parentLocation={parentLocation}
              />
            );
          })}
        </div>
      );
    }
  };

  // Cast handleChange to the expected type for the form dialog
  const handleFormChange = (field: string, value: any) => {
    console.log(`LocationsView.handleFormChange: field=${field}, value=`, value, "type=", typeof value);
    // Make sure to preserve the boolean type for boolean fields like mixWithParent
    handleChange(field as keyof LocationFormData, value);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
          Locations
        </h1>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <Button 
            startIcon={<AddIcon />}
            variant="contained" 
            color="primary"
            onPress={() => setIsAddDialogOpen(true)}
            className="btn-glow"
          >
            Add Location
          </Button>
          <Button 
            startIcon={<SaveIcon />}
            variant="outlined"
            onPress={handleSaveData}
          >
            Save Data
          </Button>
        </div>
      </div>

      {/* Floating search and view toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex-grow w-full md:w-auto shadow-md rounded-xl">
          <LocationSearch
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            resultsCount={isSearchActive 
              ? filteredLocations.length 
              : (isGridView && currentParentId 
                ? getFilteredSublocationsByParentId(currentParentId).length 
                : filteredTopLevelLocations.length)}
            totalCount={locations.length}
          />
        </div>
        <div className="flex items-center">
          <Button 
            startIcon={isGridView ? <FilterIcon /> : <SearchIcon />}
            variant="contained" 
            color="secondary"
            onPress={() => {
              setIsGridView(!isGridView);
              // Reset current parent when toggling views
              setCurrentParentId(null);
            }}
            className="shadow-md rounded-xl"
          >
            {isGridView ? "Tree View" : "Grid View"}
          </Button>
        </div>
      </div>

      {/* Current location path navigation - Only show in grid view with a parent */}
      {isGridView && currentParentId && (
        <div className="mb-4 py-2 px-4 bg-background-surface/40 rounded-xl shadow-sm flex items-center">
          <Button
            variant="text"
            startIcon={<ExpandLessIcon />}
            onPress={handleNavigateUp}
            className="text-text-secondary hover:text-text-primary"
          >
            Back
          </Button>
          <div className="mx-2 text-text-secondary">/</div>
          <Typography className="text-text-primary font-medium">
            {locations.find(loc => loc.id === currentParentId)?.name || 'Unknown Location'}
          </Typography>
        </div>
      )}

      {/* Direct content area without nested containers */}
      <div className="mb-6">
        {isSearchActive 
          ? renderSearchResults() 
          : ((isGridView && renderGrid()) || 
            (!isGridView && filteredTopLevelLocations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-background-surface flex items-center justify-center">
                  <PlaceIcon className="text-4xl text-text-secondary" />
                </div>
                <p className="text-text-secondary text-lg mb-6">No locations found. Create your first location to get started.</p>
                <Button
                  variant="contained"
                  color="primary"
                  onPress={() => setIsAddDialogOpen(true)}
                  className="btn-glow"
                >
                  Create Location
                </Button>
              </div>
            ) : (
              <div className="overflow-auto shadow-md rounded-xl bg-background-surface/30 p-4">
                <div className="space-y-1">
                  {filteredTopLevelLocations.map(location => renderLocationTree(location.id))}
                </div>
              </div>
            )))}
      </div>

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

      {/* View Description Dialog */}
      <LocationDescriptionDialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
        locationName={viewingLocationName}
        description={viewingLocationDescription}
        descriptionType={viewingDescriptionType}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={hideNotification}
        message={snackbarMessage}
        action={
          <IconButton 
            size="small" 
            aria-label="close"
            onClick={hideNotification}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </div>
  );
}; 