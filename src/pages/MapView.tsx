import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { CustomLocation, Character, Combat } from '../store';
import { Howl } from 'howler';
import { AssetManager } from '../services/assetManager';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  Divider,
  Tooltip
} from '../components/ui';
import { AssetDropZone } from '../components/AssetDropZone';
import { PDFViewerDialog } from '../components/PDFViewerDialog';
import {
  LocationSidebar,
  LocationDetails,
  LocationMap,
  EditLocationDialog,
  MapControls
} from '../components/map';
import MarkdownContent from '../components/MarkdownContent';
import {
  PersonIcon,
  StoreIcon,
  SportsKabaddiIcon,
  VideogameAssetIcon
} from '../components/ui';

export const MapView: React.FC = () => {
  const navigate = useNavigate();
  
  // Get data and functions from store
  const locations = useStore((state) => state.locations);
  const playTrack = useStore((state) => state.playTrack);
  const stopTrack = useStore((state) => state.stopTrack);
  const getSublocationsByParentId = useStore((state) => state.getSublocationsByParentId);
  const getAllTopLevelLocations = useStore((state) => state.getAllTopLevelLocations);
  const refreshAssets = useStore((state) => state.refreshAssets);
  const hasAssets = useStore((state) => state.hasAssets);
  const isLoading = useStore((state) => state.isLoading);
  const characters = useStore((state) => state.characters);
  const combats = useStore((state) => state.combats);
  const saveDataToIndexedDB = useStore((state) => state.saveDataToIndexedDB);
  const selectedLocationId = useStore((state) => state.selectedLocationId);
  const setSelectedLocationId = useStore((state) => state.setSelectedLocationId);
  const updateLocation = useStore((state) => state.updateLocation);
  
  // UI State
  const [selectedLocation, setSelectedLocation] = useState<CustomLocation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CustomLocation | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [detailsTab, setDetailsTab] = useState(0);
  
  // PDF state
  const [isPdf, setIsPdf] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfAsset, setCurrentPdfAsset] = useState('');

  // Dialog states for character and combat details
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);
  const [combatDialogOpen, setCombatDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedCombat, setSelectedCombat] = useState<Combat | null>(null);
  
  // Initialize selected location from store
  useEffect(() => {
    if (locations.length > 0) {
      if (selectedLocationId) {
        // If we have a saved location ID, try to load that location
        const savedLocation = locations.find(loc => loc.id === selectedLocationId);
        if (savedLocation) {
          setSelectedLocation(savedLocation);
          setShowDetails(true);
        } else {
          // If saved location doesn't exist anymore, load the first location
          const topLocations = getAllTopLevelLocations();
          if (topLocations.length > 0) {
            setSelectedLocation(topLocations[0]);
            setSelectedLocationId(topLocations[0].id);
          }
        }
      } else {
        // No saved location, load the first one
        const topLocations = getAllTopLevelLocations();
        if (topLocations.length > 0) {
          setSelectedLocation(topLocations[0]);
          setSelectedLocationId(topLocations[0].id);
        }
      }
    }
  }, [locations, selectedLocationId, getAllTopLevelLocations, setSelectedLocationId]);
  
  // Check if a selected location has a PDF instead of an image
  useEffect(() => {
    if (selectedLocation?.imageUrl) {
      const isPdfFile = selectedLocation.imageUrl.toLowerCase().endsWith('.pdf');
      setIsPdf(isPdfFile);
      
      if (isPdfFile) {
        setCurrentPdfAsset(selectedLocation.imageUrl);
      }
    } else {
      setIsPdf(false);
    }
  }, [selectedLocation?.id, selectedLocation?.imageUrl]);
  
  // Handle location selection
  const handleLocationSelect = async (location: CustomLocation) => {
    // If in edit mode, show edit dialog instead of regular selection
    if (editMode) {
      setEditingLocation(location);
      setShowEditDialog(true);
      return;
    }
    
    if (selectedLocation?.id !== location.id) {
      setSelectedLocation(location);
      setShowDetails(true);
      
      // Play entry sound if available
      if (location.entrySound) {
        const soundUrl = await AssetManager.getAssetUrl('audio', location.entrySound);
        
        // Only try to play the sound if a URL was returned
        if (soundUrl) {
          const locationSound = new Howl({
            src: [soundUrl],
            loop: false,
            volume: useStore.getState().volume,
          });
          locationSound.play();
        }
      }
      
      if (location.backgroundMusic) {
        // Use AssetManager to check if the audio exists before trying to play it
        const audioPath = `/audio/${location.backgroundMusic}`;
        const isSublocation = !!location.parentLocationId;
        // Only pass replace: false if this is a sublocation with mixWithParent: true
        const replace = !(isSublocation && location.mixWithParent === true);
        playTrack(audioPath, { 
          replace: replace, 
          locationId: location.id 
        });
      }
    } else {
      setShowDetails(!showDetails);
    }
    
    // Save the selected location ID in the store
    setSelectedLocationId(location.id);
  };

  // Handle asset import
  const handleAssetImport = async () => {
    // Refresh the data in the store
    await refreshAssets();
    
    // Reset the selected location to force a re-render
    if (selectedLocation) {
      const locationId = selectedLocation.id;
      setSelectedLocation(null);
      
      // Find the location in the refreshed data
      setTimeout(() => {
        const refreshedLocation = locations.find(loc => loc.id === locationId);
        if (refreshedLocation) {
          setSelectedLocation(refreshedLocation);
        }
      }, 100);
    }
  };
  
  // Handle map click to add a new location in edit mode
  const handleMapClick = (e: React.MouseEvent) => {
    if (!editMode || !selectedLocation) return;
    
    // Get the target element and its bounding rectangle
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate coordinates as percentages within the container
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Create a new location with default values
    const newLocationData: Omit<CustomLocation, 'id'> = {
      name: 'New Location',
      description: 'Add a description',
      coordinates: [x, y],
      parentLocationId: selectedLocation.id,
    };
    
    // Add the new location to the store
    const addLocation = useStore.getState().addLocation;
    addLocation(newLocationData);
    
    // Save to IndexedDB
    saveDataToIndexedDB();
  };
  
  // Handle location drop (for drag-and-drop positioning)
  const handleDrop = (e: React.DragEvent) => {
    if (!editMode) return;
    e.preventDefault();
    
    const locationId = e.dataTransfer.getData('locationId');
    if (!locationId) return;
    
    // Get the target element and its bounding rectangle
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate coordinates as percentages within the container
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Ensure coordinates are within 0-1 range
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));
    
    // Update location coordinates
    updateLocation(locationId, { coordinates: [boundedX, boundedY] });
    
    // Save to IndexedDB
    saveDataToIndexedDB();
  };
  
  // Handle drag over event
  const handleDragOver = (e: React.DragEvent) => {
    if (!editMode) return;
    e.preventDefault();
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    
    // Close edit dialog if open
    if (showEditDialog) {
      setShowEditDialog(false);
      setEditingLocation(null);
    }
  };
  
  // Function to save data
  const handleSaveData = async () => {
    const result = await saveDataToIndexedDB();
    alert(result.message);
  };
  
  // Update a location from the edit dialog
  const handleUpdateLocation = (updatedLocation: CustomLocation) => {
    updateLocation(updatedLocation.id, {
      name: updatedLocation.name,
      description: updatedLocation.description,
      coordinates: updatedLocation.coordinates,
      connectedLocations: updatedLocation.connectedLocations,
      backgroundMusic: updatedLocation.backgroundMusic,
      entrySound: updatedLocation.entrySound,
      imageUrl: updatedLocation.imageUrl
    });
    
    // Update local state
    if (selectedLocation?.id === updatedLocation.id) {
      setSelectedLocation(updatedLocation);
    }
    
    // Save changes
    saveDataToIndexedDB();
  };
  
  // Handle viewing a PDF document
  const handleViewPdf = () => {
    if (currentPdfAsset) {
      setPdfViewerOpen(true);
    }
  };
  
  // Get character type icon
  const getCharacterTypeIcon = (type: string) => {
    switch (type) {
      case 'npc':
        return <PersonIcon />;
      case 'merchant':
        return <StoreIcon />;
      case 'enemy':
        return <SportsKabaddiIcon />;
      case 'player':
        return <VideogameAssetIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Format character type for display
  const formatCharacterType = (type: string) => {
    switch (type) {
      case 'npc': return 'NPC';
      case 'merchant': return 'Merchant';
      case 'enemy': return 'Enemy';
      case 'player': return 'Player';
      default: return type;
    }
  };

  // Get color based on character type
  const getCharacterTypeColor = (type: string) => {
    switch (type) {
      case 'npc': return 'primary';
      case 'merchant': return 'warning';
      case 'enemy': return 'error';
      case 'player': return 'success';
      default: return 'default';
    }
  };

  // Open character dialog
  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setCharacterDialogOpen(true);
  };

  // Open combat dialog
  const handleCombatClick = (combat: Combat) => {
    setSelectedCombat(combat);
    setCombatDialogOpen(true);
  };

  // Start combat session
  const handleStartCombat = () => {
    if (selectedCombat) {
      navigate('/combat-session', { state: { combatId: selectedCombat.id } });
      setCombatDialogOpen(false);
    }
  };

  // Close character dialog
  const handleCloseCharacterDialog = () => {
    setCharacterDialogOpen(false);
    setSelectedCharacter(null);
  };

  // Close combat dialog
  const handleCloseCombatDialog = () => {
    setCombatDialogOpen(false);
    setSelectedCombat(null);
  };
  
  // Loading state for the entire application
  if (isLoading) {
    return (
      <Box className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <CircularProgress size={60} />
        <Typography variant="h6" className="mt-4">
          Loading your campaign...
        </Typography>
      </Box>
    );
  }

  // Empty state when no locations are available
  if (locations.length === 0) {
    return (
      <Box className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
        <Paper
          className="max-w-2xl w-full p-8 flex flex-col items-center bg-opacity-90 dark:bg-opacity-90"
        >
          <Typography variant="h4" className="mb-4 text-center">
            Welcome to Pen & Paper Project
          </Typography>
          
          <Typography variant="body1" className="mb-4 text-center">
            No campaign assets found. Please upload a zip file containing your campaign assets to get started.
          </Typography>
          
          <Typography variant="body2" className="mb-6 text-center text-gray-500">
            Your zip file should contain an "audio" folder for sound files, an "images" folder for location images, 
            and a "data" folder with your "locations.json" and "characters.json" files.
          </Typography>
          
          <AssetDropZone onAssetImport={handleAssetImport} isFullPage={true} />
        </Paper>
      </Box>
    );
  }

  // Main map view layout
  return (
    <Box className="flex h-full overflow-hidden">
      {/* Sidebar with locations or details */}
      <Paper className="w-72 h-full flex flex-col overflow-hidden z-10 shadow-md">
        <Tabs 
          value={showDetails ? 1 : 0} 
          onChange={(_, value) => setShowDetails(value === 1)}
          variant="fullWidth"
        >
          <Tab label="Locations" />
          <Tab label="Details" disabled={!selectedLocation} />
        </Tabs>
        
        {!showDetails ? (
          <LocationSidebar
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            getAllTopLevelLocations={getAllTopLevelLocations}
            getSublocationsByParentId={getSublocationsByParentId}
          />
        ) : (
          selectedLocation && (
            <LocationDetails
              location={selectedLocation}
              locations={locations}
              characters={characters}
              combats={combats}
              onBack={() => setShowDetails(false)}
              onLocationSelect={handleLocationSelect}
              playTrack={playTrack}
              onCharacterClick={handleCharacterClick}
              onCombatClick={handleCombatClick}
            />
          )
        )}
      </Paper>

      {/* Main map area */}
      <LocationMap
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
        getSublocationsByParentId={getSublocationsByParentId}
        locations={locations}
        editMode={editMode}
        onMapClick={handleMapClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      
      {/* Map controls (floating buttons) */}
      <MapControls
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        onSave={handleSaveData}
        onViewPdf={isPdf ? handleViewPdf : undefined}
        hasPdf={isPdf}
        onOpenAssetManager={() => setShowAssetManager(true)}
      />

      {/* Edit Location Dialog */}
      <EditLocationDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleUpdateLocation}
        location={editingLocation}
        locations={locations}
      />

      {/* Asset Manager Dialog - only shown when explicitly opened */}
      {showAssetManager && (
        <AssetDropZone 
          dialogOpen={showAssetManager}
          onClose={() => setShowAssetManager(false)}
          onAssetImport={handleAssetImport}
        />
      )}

      {/* PDF Viewer Dialog */}
      <PDFViewerDialog
        open={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        assetName={currentPdfAsset}
      />

      {/* Character Details Dialog */}
      <Dialog 
        open={characterDialogOpen} 
        onClose={handleCloseCharacterDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedCharacter && (
          <>
            <DialogTitle>
              <Box className="flex items-center">
                <Avatar className={
                  selectedCharacter.type === 'npc' ? 'bg-blue-100 text-blue-500 mr-3' :
                  selectedCharacter.type === 'merchant' ? 'bg-amber-100 text-amber-500 mr-3' :
                  selectedCharacter.type === 'enemy' ? 'bg-red-100 text-red-500 mr-3' :
                  'bg-green-100 text-green-500 mr-3'
                }>
                  {getCharacterTypeIcon(selectedCharacter.type)}
                </Avatar>
                <Typography variant="h6">
                  {selectedCharacter.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box className="mb-4">
                <Chip 
                  label={formatCharacterType(selectedCharacter.type)}
                  size="small"
                  color={getCharacterTypeColor(selectedCharacter.type)}
                  variant="soft"
                  className="mr-2"
                />
                {selectedCharacter.hp && (
                  <Chip 
                    label={`HP: ${selectedCharacter.hp}`} 
                    size="small" 
                    color="error" 
                    variant="soft"
                  />
                )}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>Description:</Typography>
              <Box className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <MarkdownContent content={selectedCharacter.description} />
              </Box>
              
              {selectedCharacter.inventory && selectedCharacter.inventory.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Inventory:</Typography>
                  <Box className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                    {selectedCharacter.inventory.map((item, index) => (
                      <Box key={item.id} className="mb-2">
                        <Box className="flex justify-between">
                          <Typography variant="body1" className="font-medium">
                            {item.name}
                          </Typography>
                          <Chip 
                            label={`Qty: ${item.quantity}`} 
                            size="small" 
                            color="warning" 
                            variant="soft"
                          />
                        </Box>
                        {item.description && (
                          <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                            {item.description}
                          </Typography>
                        )}
                        {index < selectedCharacter.inventory!.length - 1 && <Divider className="my-2" />}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCharacterDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Combat Details Dialog */}
      <Dialog 
        open={combatDialogOpen} 
        onClose={handleCloseCombatDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedCombat && (
          <>
            <DialogTitle>
              <Box className="flex items-center">
                <Avatar className="bg-red-100 text-red-500 mr-3">
                  <SportsKabaddiIcon />
                </Avatar>
                <Typography variant="h6">
                  {selectedCombat.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box className="mb-4">
                <Chip 
                  label={`Difficulty: ${selectedCombat.difficulty || 'Normal'}`} 
                  size="small" 
                  color="secondary"
                  variant="soft"
                  className="mr-2"
                />
                {selectedCombat.playerCharacters && (
                  <Chip 
                    label={`${selectedCombat.playerCharacters.length} players`} 
                    size="small" 
                    color="primary" 
                    variant="soft"
                  />
                )}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>Description:</Typography>
              <Box className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <MarkdownContent content={selectedCombat.description || "*No description provided*"} />
              </Box>
              
              {selectedCombat.playerCharacters && selectedCombat.playerCharacters.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Player Characters:</Typography>
                  <Box className="grid grid-cols-1 gap-2 mb-4">
                    {selectedCombat.playerCharacters.map(pc => {
                      const character = characters.find(c => c.id === pc.id);
                      if (!character) return null;
                      
                      return (
                        <Box 
                          key={character.id} 
                          className="p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center"
                        >
                          <Avatar className="bg-green-100 text-green-500 mr-2" sx={{ width: 32, height: 32 }}>
                            <VideogameAssetIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">{character.name}</Typography>
                          {character.hp && (
                            <Chip 
                              label={`HP: ${character.hp}`} 
                              size="small" 
                              color="error" 
                              variant="soft"
                              className="ml-auto"
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
              
              {selectedCombat.enemies && selectedCombat.enemies.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Enemies:</Typography>
                  <Box className="grid grid-cols-1 gap-2">
                    {selectedCombat.enemies.map(enemy => {
                      const character = characters.find(c => c.id === enemy.id);
                      if (!character) return null;
                      
                      return (
                        <Box 
                          key={character.id} 
                          className="p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center"
                        >
                          <Avatar className="bg-red-100 text-red-500 mr-2" sx={{ width: 32, height: 32 }}>
                            <SportsKabaddiIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">{character.name}</Typography>
                          {character.hp && (
                            <Chip 
                              label={`HP: ${character.hp}`} 
                              size="small" 
                              color="error" 
                              variant="soft"
                              className="ml-auto"
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCombatDialog}>Close</Button>
              <Button 
                onClick={handleStartCombat} 
                variant="contained"
                color="error"
                className="bg-red-600 hover:bg-red-700"
              >
                Start Combat Session
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MapView;