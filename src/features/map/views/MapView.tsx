import React from 'react';
import { LocationMap, LocationSidebar, MapControls, EditLocationDialog, LocationDetails } from '../components';
import { useMap, useMapInteractions, useEntityDialogs } from '../hooks';
import { PDFViewerDialog } from '../../../components/PDFViewerDialog';
import { useStore } from '../../../store';

export const MapView: React.FC = () => {
  // --- Hooks ---
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
    isPdf,
    pdfViewerOpen,
    setPdfViewerOpen,
    currentPdfAsset,
    handleLocationSelect,
    toggleEditMode,
    handleSaveData,
    handleUpdateLocation,
    handleViewPdf,
    getSublocationsByParentId,
    getAllTopLevelLocations,
    setShowDetails,
    setShowEditDialog
  } = useMap();

  const {
    mapContainerRef,
    handleMapClick,
    handleDragOver,
    handleDrop,
  } = useMapInteractions({
    editMode,
    selectedLocation,
    onLocationUpdate: handleUpdateLocation
  });

  const {
    handleCharacterClick,
    handleCombatClick,
  } = useEntityDialogs();

  const playTrack = useStore((state) => state.playTrack);

  // --- Render using modern design language ---
  return (
    <div className="h-full w-full flex flex-col">
      {/* Page header with gradient text effect */}
      <div className="p-4 border-b border-border-DEFAULT/20 bg-background-surface/30">
        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
          World Map
        </h1>
      </div>

      {/* Main content area - full screen width and height */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar - Fixed width sidebar */}
        <div className="w-64 min-w-64 border-r border-border-DEFAULT/20 flex flex-col overflow-hidden bg-background-elevated/20">
          <div className="p-3 bg-background-surface/30 border-b border-border-DEFAULT/20">
            <h2 className="text-lg font-display font-semibold text-text-primary">Locations</h2>
          </div>
          <div className="flex-grow overflow-auto">
            <LocationSidebar
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              getAllTopLevelLocations={getAllTopLevelLocations}
              getSublocationsByParentId={getSublocationsByParentId}
            />
          </div>
        </div>

        {/* Center - Map Area - Takes all available space */}
        <div className="flex-grow relative overflow-hidden">
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
            mapContainerRef={mapContainerRef}
          />
          <MapControls
            editMode={editMode}
            onToggleEditMode={toggleEditMode}
            onSave={handleSaveData}
            onViewPdf={isPdf && selectedLocation?.imageUrl ? () => handleViewPdf() : undefined}
            hasPdf={isPdf}
            onOpenAssetManager={() => setShowAssetManager(true)}
          />
        </div>

        {/* Right Sidebar - Fixed width when shown */}
        {selectedLocation && showDetails && (
          <div className="w-72 min-w-72 border-l border-border-DEFAULT/20 overflow-hidden bg-background-elevated/20">
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
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showEditDialog && editingLocation && (
        <EditLocationDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleUpdateLocation}
          location={editingLocation}
          locations={locations}
        />
      )}

      {pdfViewerOpen && currentPdfAsset && (
        <PDFViewerDialog
          open={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          assetName={currentPdfAsset}
        />
      )}
    </div>
  );
};

// Ensure component has a display name for React DevTools
MapView.displayName = 'MapView';

// Export as default if it's the primary export, otherwise keep named export
// export default MapView; // Uncomment if this should be the default export 