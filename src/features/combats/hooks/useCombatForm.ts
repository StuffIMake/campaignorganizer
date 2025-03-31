import { useState, useEffect } from 'react';
import { Combat, Character, Item } from '../../../store';
import { AssetManager } from '../../../services/assetManager';

// Interface for enemy instances with count
export interface EnemyInstance {
  character: Character;
  count: number;
}

// For reward items
export interface RewardItemFormData {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price?: number;
}

export const useCombatForm = (initialCombat?: Combat | null) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCombat, setSelectedCombat] = useState<Combat | null>(initialCombat || null);
  const [audioAssets, setAudioAssets] = useState<string[]>([]);
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  const [enemyInstances, setEnemyInstances] = useState<EnemyInstance[]>([]);
  
  // Search queries for dropdowns
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [bgMusicSearchQuery, setBgMusicSearchQuery] = useState('');
  const [entrySoundSearchQuery, setEntrySoundSearchQuery] = useState('');
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [enemySearchQuery, setEnemySearchQuery] = useState('');
  
  // Reward item state
  const [newRewardItem, setNewRewardItem] = useState<RewardItemFormData>({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    quantity: 1
  });
  const [isAddRewardDialogOpen, setIsAddRewardDialogOpen] = useState(false);
  const [isEditRewardDialogOpen, setIsEditRewardDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  
  // Form data
  const [editedCombat, setEditedCombat] = useState<Partial<Combat>>({
    name: '',
    description: '',
    descriptionType: 'markdown',
    playerCharacters: [],
    enemies: [],
    difficulty: 'medium',
    rewards: []
  });
  
  // Load assets when the dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const loadAssets = async () => {
        const audioAssetsData = await AssetManager.getAssets('audio');
        setAudioAssets(audioAssetsData.map(asset => asset.name));
        
        const imageAssetsData = await AssetManager.getAssets('images');
        setImageAssets(imageAssetsData.map(asset => asset.name));
      };
      loadAssets();
    }
  }, [isDialogOpen]);
  
  // Initialize enemy instances when dialog opens or when editing a combat
  useEffect(() => {
    if (isDialogOpen && selectedCombat) {
      // Create a map to count occurrences of each enemy
      const enemyCounts = new Map<string, number>();
      const enemyMap = new Map<string, Character>();
      
      selectedCombat.enemies.forEach(enemy => {
        const count = enemyCounts.get(enemy.id) || 0;
        enemyCounts.set(enemy.id, count + 1);
        enemyMap.set(enemy.id, enemy);
      });
      
      // Convert to instances array
      const instances: EnemyInstance[] = [];
      enemyCounts.forEach((count, id) => {
        const character = enemyMap.get(id);
        if (character) {
          instances.push({ character, count });
        }
      });
      
      setEnemyInstances(instances);
      setEditedCombat(selectedCombat); // Initialize form with selected combat
    } else if (isDialogOpen && !selectedCombat) {
      // Reset for new combat
      setEnemyInstances([]);
      setEditedCombat({
        name: '',
        description: '',
        descriptionType: 'markdown',
        playerCharacters: [],
        enemies: [],
        difficulty: 'medium',
        rewards: []
      });
    }
  }, [isDialogOpen, selectedCombat]);
  
  // Open the dialog for adding a new combat
  const handleAddClick = () => {
    setSelectedCombat(null);
    setIsDialogOpen(true);
  };
  
  // Open the dialog for editing an existing combat
  const handleEditClick = (combat: Combat) => {
    setSelectedCombat(combat);
    setIsDialogOpen(true);
  };
  
  // Close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };
  
  // Reset the form
  const resetForm = () => {
    setEditedCombat({
      name: '',
      description: '',
      descriptionType: 'markdown',
      playerCharacters: [],
      enemies: [],
      difficulty: 'medium',
      rewards: []
    });
    setEnemyInstances([]);
    setSelectedCombat(null);
    setLocationSearchQuery('');
    setBgMusicSearchQuery('');
    setEntrySoundSearchQuery('');
    setImageSearchQuery('');
    setEnemySearchQuery('');
    setNewRewardItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1
    });
    setIsAddRewardDialogOpen(false);
    setIsEditRewardDialogOpen(false);
    setEditingRewardId(null);
  };
  
  // Handle selecting characters (player characters or enemies)
  const handleCharacterSelection = (characterIds: string[], field: 'playerCharacters' | 'enemies', characters: Character[]) => {
    const selectedCharacters = characters.filter(char => characterIds.includes(char.id));
    setEditedCombat({
      ...editedCombat,
      [field]: selectedCharacters
    });
  };
  
  // Handle adding an enemy
  const handleAddEnemy = (enemyId: string, enemyCharacters: Character[]) => {
    const enemy = enemyCharacters.find(char => char.id === enemyId);
    if (!enemy) return;
    
    // Check if this enemy is already in the instances
    const existingInstance = enemyInstances.find(instance => instance.character.id === enemyId);
    
    if (existingInstance) {
      // If exists, increment count
      setEnemyInstances(enemyInstances.map(instance => 
        instance.character.id === enemyId
          ? { ...instance, count: instance.count + 1 }
          : instance
      ));
    } else {
      // If doesn't exist, add with count 1
      setEnemyInstances([...enemyInstances, { character: enemy, count: 1 }]);
    }
    
    // Update enemies in edited combat
    const updatedEnemies = [...(editedCombat.enemies || []), enemy];
    setEditedCombat({
      ...editedCombat,
      enemies: updatedEnemies
    });
  };
  
  // Handle removing an enemy
  const handleRemoveEnemy = (enemyId: string) => {
    // Find the instance
    const instance = enemyInstances.find(inst => inst.character.id === enemyId);
    
    if (!instance) return;
    
    if (instance.count > 1) {
      // If more than one, decrease count
      setEnemyInstances(enemyInstances.map(inst => 
        inst.character.id === enemyId
          ? { ...inst, count: inst.count - 1 }
          : inst
      ));
      
      // Remove one from editedCombat.enemies
      const enemies = [...(editedCombat.enemies || [])];
      const enemyIndex = enemies.findIndex(e => e.id === enemyId);
      if (enemyIndex !== -1) {
        enemies.splice(enemyIndex, 1);
        setEditedCombat({
          ...editedCombat,
          enemies
        });
      }
    } else {
      // If only one, remove completely
      setEnemyInstances(enemyInstances.filter(inst => inst.character.id !== enemyId));
      
      // Remove all of this enemy from editedCombat.enemies
      setEditedCombat({
        ...editedCombat,
        enemies: (editedCombat.enemies || []).filter(e => e.id !== enemyId)
      });
    }
  };
  
  // Handle opening dialog to add a reward
  const handleOpenAddRewardDialog = () => {
    setNewRewardItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1
    });
    setIsAddRewardDialogOpen(true);
  };
  
  // Handle adding a reward item
  const handleAddReward = () => {
    const rewardItem: Item = {
      id: newRewardItem.id,
      name: newRewardItem.name,
      description: newRewardItem.description,
      quantity: newRewardItem.quantity,
      price: newRewardItem.price
    };
    
    setEditedCombat({
      ...editedCombat,
      rewards: [...(editedCombat.rewards || []), rewardItem]
    });
    
    setIsAddRewardDialogOpen(false);
    setNewRewardItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1
    });
  };
  
  // Handle opening dialog to edit a reward
  const handleEditRewardClick = (itemId: string) => {
    const item = editedCombat.rewards?.find(r => r.id === itemId);
    if (!item) return;
    
    setNewRewardItem({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price
    });
    setEditingRewardId(itemId);
    setIsEditRewardDialogOpen(true);
  };
  
  // Handle saving an edited reward item
  const handleSaveEditedReward = () => {
    if (!editingRewardId || !editedCombat.rewards) return;
    
    const updatedRewards = editedCombat.rewards.map(item => 
      item.id === editingRewardId
        ? {
            ...item,
            name: newRewardItem.name,
            description: newRewardItem.description,
            quantity: newRewardItem.quantity,
            price: newRewardItem.price
          }
        : item
    );
    
    setEditedCombat({
      ...editedCombat,
      rewards: updatedRewards
    });
    
    setIsEditRewardDialogOpen(false);
    setEditingRewardId(null);
    setNewRewardItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1
    });
  };
  
  // Handle deleting a reward item
  const handleDeleteReward = (itemId: string) => {
    setEditedCombat({
      ...editedCombat,
      rewards: editedCombat.rewards?.filter(item => item.id !== itemId) || []
    });
  };
  
  // Update a field in the combat form
  const handleFormChange = (field: keyof Combat, value: any) => {
    setEditedCombat({
      ...editedCombat,
      [field]: value
    });
  };
  
  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedCombat,
    setSelectedCombat,
    audioAssets,
    imageAssets,
    enemyInstances,
    locationSearchQuery,
    setLocationSearchQuery,
    bgMusicSearchQuery,
    setBgMusicSearchQuery,
    entrySoundSearchQuery,
    setEntrySoundSearchQuery,
    imageSearchQuery,
    setImageSearchQuery,
    enemySearchQuery,
    setEnemySearchQuery,
    newRewardItem,
    setNewRewardItem,
    isAddRewardDialogOpen,
    setIsAddRewardDialogOpen,
    isEditRewardDialogOpen,
    setIsEditRewardDialogOpen,
    editingRewardId,
    setEditingRewardId,
    editedCombat,
    setEditedCombat,
    handleAddClick,
    handleEditClick,
    handleCloseDialog,
    resetForm,
    handleCharacterSelection,
    handleAddEnemy,
    handleRemoveEnemy,
    handleOpenAddRewardDialog,
    handleAddReward,
    handleEditRewardClick,
    handleSaveEditedReward,
    handleDeleteReward,
    handleFormChange
  };
}; 