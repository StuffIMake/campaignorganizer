import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../store';
import { Character, Item } from '../../../store';
import { AssetManager } from '../../../services/assetManager';

export const useCharacters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  
  const { 
    characters, 
    locations,
    addCharacter, 
    updateCharacter, 
    deleteCharacter, 
    saveDataToIndexedDB 
  } = useStore();
  
  // Filter characters based on search query
  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return characters;
    
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return characters.filter(character => {
      // Search in various character fields
      const searchableFields = [
        character.name.toLowerCase(),
        character.description.toLowerCase(),
        character.type.toLowerCase(),
        `hp:${character.hp}`,
        // Include location name if present
        character.locationId ? 
          locations.find(loc => loc.id === character.locationId)?.name.toLowerCase() || '' : ''
      ];
      
      // Include inventory items if present
      if (character.inventory && character.inventory.length > 0) {
        character.inventory.forEach((item: any) => {
          searchableFields.push(item.name.toLowerCase());
          if (item.description) searchableFields.push(item.description.toLowerCase());
        });
      }
      
      // Check if any search term matches any field
      return searchTerms.some(term => 
        searchableFields.some(field => field.includes(term))
      );
    });
  }, [characters, searchQuery, locations]);
  
  // Load image assets
  const loadImageAssets = async () => {
    try {
      const imageAssetsData = await AssetManager.getAssets('images');
      setImageAssets(imageAssetsData.map(asset => asset.name));
    } catch (error) {
      console.error('Error loading image assets:', error);
    }
  };
  
  const saveData = async () => {
    try {
      await saveDataToIndexedDB();
      return { success: true, message: 'Data saved successfully' };
    } catch (error) {
      console.error('Error saving data:', error);
      return { success: false, message: 'Error saving data' };
    }
  };
  
  return {
    characters,
    filteredCharacters,
    locations,
    imageAssets,
    searchQuery,
    setSearchQuery,
    loadImageAssets,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    saveData
  };
}; 