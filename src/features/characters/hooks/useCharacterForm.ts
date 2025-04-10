import { useState } from 'react';
import { Character, Item } from '../../../store';

interface CharacterFormData {
  name: string;
  description: string;
  type: 'npc' | 'merchant' | 'enemy' | 'player';
  locationId: string;
  descriptionType: 'markdown' | 'image' | 'pdf';
  descriptionAssetName: string;
  hp: number | string;
  inventory?: Item[];
}

export const useCharacterForm = (
  onAdd: (character: Omit<Character, 'id'>) => void,
  onUpdate: (id: string, updates: Partial<Character>) => void
) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    description: '',
    type: 'npc',
    locationId: '',
    descriptionType: 'markdown',
    descriptionAssetName: '',
    hp: 10,
    inventory: []
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'npc',
      locationId: '',
      descriptionType: 'markdown',
      descriptionAssetName: '',
      hp: 10,
      inventory: []
    });
  };
  
  const handleAddCharacter = () => {
    const character: Omit<Character, 'id'> = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      hp: typeof formData.hp === 'string' 
           ? (parseInt(formData.hp) || 1) 
           : (formData.hp || 1),  // Ensure we always have a valid number
      inventory: formData.inventory // Add the inventory to the new character
    };
    
    if (formData.locationId) {
      character.locationId = formData.locationId;
    }
    
    character.descriptionType = formData.descriptionType;
    
    if (formData.descriptionAssetName) {
      character.descriptionAssetName = formData.descriptionAssetName;
    }
    
    onAdd(character);
    setIsAddDialogOpen(false);
    resetForm();
  };
  
  const handleEditCharacter = (character: Character) => {
    setEditingCharacterId(character.id);
    setFormData({
      name: character.name,
      description: character.description,
      type: character.type,
      locationId: character.locationId || '',
      descriptionType: character.descriptionType || 'markdown',
      descriptionAssetName: character.descriptionAssetName || '',
      hp: character.hp !== undefined ? character.hp : 1,
      inventory: character.inventory || []
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSaveCharacter = () => {
    if (editingCharacterId) {
      const updates: Partial<Character> = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        hp: typeof formData.hp === 'string' 
             ? (parseInt(formData.hp) || 1) 
             : (formData.hp || 1),
        inventory: formData.inventory
      };
      
      if (formData.locationId) {
        updates.locationId = formData.locationId;
      } else {
        updates.locationId = undefined; // Clear the locationId if not selected
      }
      
      updates.descriptionType = formData.descriptionType;
      
      if (formData.descriptionAssetName) {
        updates.descriptionAssetName = formData.descriptionAssetName;
      } else {
        updates.descriptionAssetName = undefined;
      }
      
      onUpdate(editingCharacterId, updates);
      setIsEditDialogOpen(false);
      setEditingCharacterId(null);
      resetForm();
    }
  };
  
  const handleChange = (field: keyof CharacterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formData,
    handleChange,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingCharacterId,
    handleAddCharacter,
    handleEditCharacter,
    handleSaveCharacter,
    resetForm
  };
}; 