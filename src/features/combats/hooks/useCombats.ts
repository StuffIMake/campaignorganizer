import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../store';
import { Combat, Character, Item, CustomLocation } from '../../../store';

export const useCombats = () => {
  const { combats, characters, locations, addCombat, updateCombat, deleteCombat } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter combats based on search query
  const filteredCombats = useMemo(() => {
    if (!searchQuery.trim()) return combats;
    
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return combats.filter(combat => {
      // Search in various combat fields
      const searchableFields = [
        combat.name.toLowerCase(),
        combat.description.toLowerCase(),
        (combat.difficulty || 'medium').toLowerCase(),
        combat.locationId ? 
          locations.find(loc => loc.id === combat.locationId)?.name.toLowerCase() || '' : '',
        combat.entrySound?.toLowerCase() || '',
        combat.backgroundMusic?.toLowerCase() || '',
        combat.backgroundImage?.toLowerCase() || ''
      ];
      
      // Add player character names and stats
      combat.playerCharacters.forEach(pc => {
        searchableFields.push(pc.name.toLowerCase());
        searchableFields.push(`player hp:${pc.hp}`);
        searchableFields.push(pc.type.toLowerCase());
      });
      
      // Add enemy names and stats
      combat.enemies.forEach(enemy => {
        searchableFields.push(enemy.name.toLowerCase());
        searchableFields.push(`enemy hp:${enemy.hp}`);
        searchableFields.push(enemy.type.toLowerCase());
      });
      
      // Group enemies by name for better search (e.g., "3 goblins")
      const enemyCounts: Record<string, number> = {};
      combat.enemies.forEach(enemy => {
        enemyCounts[enemy.name] = (enemyCounts[enemy.name] || 0) + 1;
      });
      
      // Add enemy counts as searchable text
      Object.entries(enemyCounts).forEach(([name, count]) => {
        if (count > 1) {
          searchableFields.push(`${count} ${name.toLowerCase()}`);
        }
      });
      
      // Check if any search term matches any field
      return searchTerms.some(term => 
        searchableFields.some(field => field.includes(term))
      );
    });
  }, [combats, searchQuery, locations]);

  // Filter characters by type
  const playerCharacters = useMemo(() => 
    characters.filter(char => char.type === 'player'),
    [characters]
  );
  
  const enemyCharacters = useMemo(() => 
    characters.filter(char => char.type === 'enemy'),
    [characters]
  );

  // Add a combat
  const handleAddCombat = (combat: Combat) => {
    addCombat(combat);
  };

  // Update a combat
  const handleUpdateCombat = (combat: Combat) => {
    updateCombat(combat.id, combat);
  };

  // Delete a combat
  const handleDeleteCombat = (combatId: string) => {
    deleteCombat(combatId);
  };

  return {
    combats,
    filteredCombats,
    playerCharacters,
    enemyCharacters,
    locations,
    searchQuery,
    setSearchQuery,
    handleAddCombat,
    handleUpdateCombat,
    handleDeleteCombat
  };
}; 