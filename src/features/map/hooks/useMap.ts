/**
 * @file useMap.ts
 * @description Custom hook for managing the map feature state and operations
 */

import { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { CustomLocation, Character, Combat } from '../../../store';
import { Howl } from 'howler';
import { AssetManager } from '../../../services/assetManager';

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
    playTrack,
    stopTrack,
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
  
  // Handle viewing PDF
  const handleViewPdf = (url?: string) => {
    if (isPdf) {
      // Use the provided URL if available, otherwise use currentPdfAsset
      const pdfUrl = url || currentPdfAsset;
      if (pdfUrl) {
        setCurrentPdfAsset(pdfUrl);
        setPdfViewerOpen(true);
      }
    }
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