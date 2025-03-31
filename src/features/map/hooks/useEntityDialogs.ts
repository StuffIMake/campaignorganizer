import { useState } from 'react';
import { Character, Combat } from '../../../store';
import { useNavigate } from 'react-router-dom';

export const useEntityDialogs = () => {
  const navigate = useNavigate();
  
  // Dialog states for character and combat details
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);
  const [combatDialogOpen, setCombatDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedCombat, setSelectedCombat] = useState<Combat | null>(null);
  
  // Handle character click to show details
  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setCharacterDialogOpen(true);
  };
  
  // Handle combat click to show details
  const handleCombatClick = (combat: Combat) => {
    setSelectedCombat(combat);
    setCombatDialogOpen(true);
  };
  
  // Handle starting a combat session
  const handleStartCombat = () => {
    if (selectedCombat) {
      // Navigate to the combat session view with the selected combat ID
      navigate(`/combat-session?id=${selectedCombat.id}`);
      // Close the dialog
      setCombatDialogOpen(false);
    }
  };
  
  // Handle closing character dialog
  const handleCloseCharacterDialog = () => {
    setCharacterDialogOpen(false);
    setSelectedCharacter(null);
  };
  
  // Handle closing combat dialog
  const handleCloseCombatDialog = () => {
    setCombatDialogOpen(false);
    setSelectedCombat(null);
  };
  
  // Helper functions for character UI
  const getCharacterTypeIcon = (type: string) => {
    switch (type) {
      case 'merchant':
        return 'StoreIcon';
      case 'enemy':
        return 'SportsKabaddiIcon';
      case 'player':
        return 'PersonIcon';
      default:
        return 'VideogameAssetIcon';
    }
  };
  
  const formatCharacterType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getCharacterTypeColor = (type: string) => {
    switch (type) {
      case 'merchant':
        return 'success';
      case 'enemy':
        return 'error';
      case 'player':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  return {
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
  };
}; 