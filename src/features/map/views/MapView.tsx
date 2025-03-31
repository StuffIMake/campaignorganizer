import React from 'react';
import { Box, Paper, Grid, Typography } from '../../../components/ui';
import { LocationMap, LocationSidebar, MapControls, EditLocationDialog, LocationDetails } from '../components';
import { useMap, useMapInteractions, useEntityDialogs } from '../hooks';
import { PDFViewerDialog } from '../../../components/PDFViewerDialog';
import { useStore } from '../../../store';

export const MapView: React.FC = () => {
  // Use custom hooks for map functionality
  const { 
    locations,
    characters,
    combats,
    selectedLocation,
    showDetails,
    showAssetManager,
    setShowAssetManager,
    editMode,
    editingLocation,
    showEditDialog,
    detailsTab,
    isPdf,
    pdfViewerOpen,
    setPdfViewerOpen,
    currentPdfAsset,
    handleLocationSelect,
    handleAssetImport,
    toggleEditMode,
    handleSaveData,
    handleUpdateLocation,
    handleViewPdf,
    getSublocationsByParentId,
    getAllTopLevelLocations,
    setShowDetails,
    setShowEditDialog
  } = useMap();
  
  // Map interaction handlers
  const {
    handleMapClick,
    handleDragOver,
    handleDrop,
    handleCharacterDragStart,
    handleLocationDrop
  } = useMapInteractions({
    editMode,
    selectedLocation,
    onLocationUpdate: handleUpdateLocation
  });
  
  // Entity dialog handlers for characters and combats
  const {
    characterDialogOpen,
    combatDialogOpen,
    selectedCharacter,
    selectedCombat,
    handleCharacterClick,
    handleCombatClick,
    handleStartCombat,
    handleCloseCharacterDialog,
    handleCloseCombatDialog,
    getCharacterTypeIcon,
    formatCharacterType,
    getCharacterTypeColor
  } = useEntityDialogs();

  // Get the actual store playTrack function
  const { playTrack } = useStore.getState();

  return (
    <Box className="h-full flex flex-col p-0 overflow-hidden">
      <Paper className="flex flex-col flex-grow h-full overflow-hidden rounded-none">
        <Grid container className="flex-grow h-full overflow-hidden">
          {/* Left sidebar for location hierarchy */}
          <Grid item xs={3} className="border-right h-full flex flex-col overflow-hidden">
            <Box className="flex flex-col h-full overflow-hidden">
              <Typography variant="h6" className="p-4 bg-gray-100 dark:bg-gray-800">
                Locations
              </Typography>
              <LocationSidebar
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
                getAllTopLevelLocations={getAllTopLevelLocations}
                getSublocationsByParentId={getSublocationsByParentId}
              />
            </Box>
          </Grid>
          
          {/* Center - Map area */}
          <Grid item xs={showDetails ? 6 : 9} className="relative h-full overflow-hidden">
            <Box className="relative flex flex-col h-full overflow-hidden">
              <LocationMap
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
                getSublocationsByParentId={getSublocationsByParentId}
                locations={locations}
                editMode={editMode}
                onMapClick={handleMapClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onViewPdf={handleViewPdf}
              />
              
              <MapControls
                editMode={editMode}
                onToggleEditMode={toggleEditMode}
                onSave={handleSaveData}
                onViewPdf={isPdf && selectedLocation?.imageUrl ? () => handleViewPdf() : undefined}
                hasPdf={isPdf}
                onOpenAssetManager={() => setShowAssetManager(true)}
              />
            </Box>
          </Grid>
          
          {/* Right sidebar for location details */}
          {showDetails && selectedLocation && (
            <Grid item xs={3} className="border-left h-full flex flex-col overflow-hidden">
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
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Edit Location Dialog */}
      {showEditDialog && (
        <EditLocationDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleUpdateLocation}
          location={editingLocation}
          locations={locations}
        />
      )}
      
      {/* PDF Viewer Dialog */}
      {pdfViewerOpen && currentPdfAsset && (
        <PDFViewerDialog
          open={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          assetName={currentPdfAsset}
        />
      )}
    </Box>
  );
}; 