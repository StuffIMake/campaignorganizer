/**
 * @file useMap.ts
 * @description Custom hook for managing the map feature state and operations
 */

import { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { CustomLocation, Character, Combat } from '../../../store';
import { AssetManager } from '../../../services/assetManager';
import { useAudioPlayer } from '../../audio/hooks/useAudioPlayer';

/**
 * Custom hook that provides map state management and operations
 * 
 * This hook handles map interactions including:
 * - Location selection and state
 * - Asset management integration
 * - Edit mode toggling
 * - Location updates
 * - PDF viewing
 * 
 * @returns {Object} Map state and functions
 */
export const useMap = () => {
  const {
    locations,
    characters,
    combats,
    getSublocationsByParentId,
    getAllTopLevelLocations,
    refreshAssets,
    hasAssets,
    isLoading,
    saveDataToIndexedDB,
    selectedLocationId,
    setSelectedLocationId,
    updateLocation
  } = useStore();
  
  // Get audio player functions from the *hook*
  const { play, stopLocationTracks } = useAudioPlayer();
  
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

  // Initialize selected location from store
  useEffect(() => {
    if (locations.length > 0) {
      if (selectedLocationId) {
        // If we have a saved location ID, try to load that location
        const savedLocation = locations.find(loc => loc.id === selectedLocationId);
        if (savedLocation) {
          setSelectedLocation(savedLocation);
          setShowDetails(true); // Always show details when loading a saved location
        } else {
          // If saved location doesn't exist anymore, load the first location
          const topLocations = getAllTopLevelLocations();
          if (topLocations.length > 0) {
            setSelectedLocation(topLocations[0]);
            setSelectedLocationId(topLocations[0].id);
            setShowDetails(true); // Show details for the first location
          }
        }
      } else {
        // No saved location, load the first one
        const topLocations = getAllTopLevelLocations();
        if (topLocations.length > 0) {
          setSelectedLocation(topLocations[0]);
          setSelectedLocationId(topLocations[0].id);
          setShowDetails(true); // Show details for the first location
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
        // Instead of directly using the imageUrl, get a blob URL from AssetManager
        AssetManager.getAssetUrl('images', selectedLocation.imageUrl)
          .then(blobUrl => {
            // Only set the PDF asset if we got a valid URL
            if (blobUrl) {
              setCurrentPdfAsset(blobUrl);
            } else {
              console.error('Failed to get blob URL for PDF:', selectedLocation.imageUrl);
            }
          })
          .catch(err => {
            console.error('Error getting blob URL for PDF:', err);
          });
      }
    } else {
      setIsPdf(false);
    }
  }, [selectedLocation?.id, selectedLocation?.imageUrl]);
  
  // Handle location selection
  const handleLocationSelect = (location: CustomLocation) => {
    // If in edit mode, show edit dialog instead of regular selection
    if (editMode) {
      setEditingLocation(location);
      setShowEditDialog(true);
      return;
    }
    
    const previousLocationId = selectedLocation?.id;
    
    // Always set the selected location
    setSelectedLocation(location);
    
    // Always show details when selecting a location - no conditionals
    setShowDetails(true);
    
    const isSublocation = !!location.parentLocationId;
    const shouldMixWithParent = isSublocation && location.mixWithParent === true;
    
    // Stop previous location's tracks if IDs differ and we are NOT mixing
    if (previousLocationId && previousLocationId !== location.id && !shouldMixWithParent) {
      console.log(`useMap.handleLocationSelect: Stopping tracks for previous location: ${previousLocationId}`);
      // Use the prefix matching stop function
      stopLocationTracks(previousLocationId); 
    }
    
    // Play entry sound if available
    if (location.entrySound) {
      // Entry sounds always replace previous *entry* sounds for the *same* location
      play(location.entrySound, { 
        replace: true, 
        locationId: `${location.id}-entry`, 
        loop: false
      });
    }
    
    // Play background music
    if (location.backgroundMusic) {
      // Replace = true UNLESS mixing with parent
      const replaceBgm = !shouldMixWithParent;
      
      play(location.backgroundMusic, { 
        replace: replaceBgm, 
        locationId: location.id, // BGM uses the location ID directly
        loop: true 
      });
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
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    
    // Reset edit-related state when exiting edit mode
    if (editMode) {
      setEditingLocation(null);
      setShowEditDialog(false);
    }
  };
  
  // Handle saving data
  const handleSaveData = async () => {
    await saveDataToIndexedDB();
    return { success: true, message: 'Map data saved successfully' };
  };
  
  // Handle updating a location
  const handleUpdateLocation = (updatedLocation: CustomLocation) => {
    updateLocation(updatedLocation.id, updatedLocation);
    
    // If we're updating the currently selected location, update local state as well
    if (selectedLocation && selectedLocation.id === updatedLocation.id) {
      setSelectedLocation(updatedLocation);
    }
    
    // Close the edit dialog
    setShowEditDialog(false);
    setEditingLocation(null);
  };
  
  // Handler to view PDF assets
  const handleViewPdf = (pdfAsset?: string) => {
    // If a specific PDF asset is provided, use it
    if (pdfAsset) {
      setCurrentPdfAsset(pdfAsset);
    }
    // Otherwise use the current PDF asset (from the location)
    
    // Show the PDF viewer dialog instead of trying to navigate to the PDF directly
    setPdfViewerOpen(true);
  };

  return {
    locations,
    characters,
    combats,
    selectedLocation,
    setSelectedLocation,
    showDetails,
    setShowDetails,
    showAssetManager,
    setShowAssetManager,
    editMode,
    setEditMode,
    editingLocation,
    setEditingLocation,
    showEditDialog,
    setShowEditDialog,
    detailsTab,
    setDetailsTab,
    isPdf,
    pdfViewerOpen,
    setPdfViewerOpen,
    currentPdfAsset,
    isLoading,
    hasAssets,
    handleLocationSelect,
    handleAssetImport,
    toggleEditMode,
    handleSaveData,
    handleUpdateLocation,
    handleViewPdf,
    getSublocationsByParentId,
    getAllTopLevelLocations
  };
}; 