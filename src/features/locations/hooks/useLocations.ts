import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../store';
import { CustomLocation } from '../../../store';
import { AssetManager } from '../../../services/assetManager';

export const useLocations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});
  
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
  const filteredLocations = useMemo(() => {
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
  const filteredTopLevelLocations = useMemo(() => {
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

  const toggleLocationExpand = (locationId: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  const saveData = async () => {
    try {
      await saveDataToIndexedDB();
      return { success: true, message: 'Campaign data saved successfully' };
    } catch (error) {
      console.error('Error saving data:', error);
      return { success: false, message: 'Error saving campaign data' };
    }
  };

  return {
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
  };
}; 