import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  InputLabel,
  TextField,
  Select,
  Item as SelectItem,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  IconButton,
  Autocomplete,
} from '../../../components/ui';
import { AddIcon, RemoveIcon, EditIcon, DeleteIcon } from '../../../assets/icons';
import { CombatSearch, CombatCard } from '../components';
import { useCombats, useCombatForm, EnemyInstance } from '../hooks';
import { Combat, Item, Character, CustomLocation } from '../../../store';
import type { CombatDifficulty } from '../../../types/combat';

export const CombatsView: React.FC = () => {
  const { 
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
  } = useCombats();
  
  const {
    isDialogOpen,
    selectedCombat,
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
    editedCombat,
    setEditedCombat,
    handleAddClick,
    handleEditClick,
    handleCloseDialog,
    handleCharacterSelection,
    handleAddEnemy,
    handleRemoveEnemy,
    handleOpenAddRewardDialog,
    handleAddReward,
    handleEditRewardClick,
    handleSaveEditedReward,
    handleDeleteReward,
    handleFormChange
  } = useCombatForm();
  
  // Confirm deletion of a combat
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [combatToDelete, setCombatToDelete] = useState<string | null>(null);
  
  // Handle clicking the delete button on a combat
  const handleDeleteClick = (combatId: string) => {
    setCombatToDelete(combatId);
    setShowDeleteConfirm(true);
  };
  
  // Confirm and execute deletion
  const confirmDelete = () => {
    if (combatToDelete) {
      handleDeleteCombat(combatToDelete);
      setShowDeleteConfirm(false);
      setCombatToDelete(null);
    }
  };
  
  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCombatToDelete(null);
  };
  
  // Handle saving a combat
  const handleSave = () => {
    // Create a full Combat object from the edited data
    const combatToSave: Combat = {
      id: selectedCombat?.id || crypto.randomUUID(),
      name: editedCombat.name || 'Unnamed Combat',
      description: editedCombat.description || '',
      descriptionType: editedCombat.descriptionType || 'markdown',
      backgroundMusic: editedCombat.backgroundMusic,
      entrySound: editedCombat.entrySound,
      backgroundImage: editedCombat.backgroundImage,
      playerCharacters: editedCombat.playerCharacters || [],
      enemies: editedCombat.enemies || [],
      rewards: editedCombat.rewards || [],
      difficulty: editedCombat.difficulty || 'medium',
      locationId: editedCombat.locationId,
      createdAt: selectedCombat?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (selectedCombat) {
      handleUpdateCombat(combatToSave);
    } else {
      handleAddCombat(combatToSave);
    }
    
    handleCloseDialog();
  };
  
  // Filter functions for dropdowns
  const filteredLocations = React.useMemo(() => {
    if (!locationSearchQuery) return locations;
    const query = locationSearchQuery.toLowerCase();
    return locations.filter(location => 
      location.name.toLowerCase().includes(query)
    );
  }, [locations, locationSearchQuery]);
  
  const filteredBgMusicAssets = React.useMemo(() => {
    if (!bgMusicSearchQuery) return audioAssets;
    const query = bgMusicSearchQuery.toLowerCase();
    return audioAssets.filter(asset => 
      asset.toLowerCase().includes(query)
    );
  }, [audioAssets, bgMusicSearchQuery]);
  
  const filteredEntrySoundAssets = React.useMemo(() => {
    if (!entrySoundSearchQuery) return audioAssets;
    const query = entrySoundSearchQuery.toLowerCase();
    return audioAssets.filter(asset => 
      asset.toLowerCase().includes(query)
    );
  }, [audioAssets, entrySoundSearchQuery]);
  
  const filteredImageAssets = React.useMemo(() => {
    if (!imageSearchQuery) return imageAssets;
    const query = imageSearchQuery.toLowerCase();
    return imageAssets.filter(asset => 
      asset.toLowerCase().includes(query)
    );
  }, [imageAssets, imageSearchQuery]);
  
  const filteredEnemyCharacters = React.useMemo(() => {
    if (!enemySearchQuery) return enemyCharacters;
    const query = enemySearchQuery.toLowerCase();
    return enemyCharacters.filter(enemy => 
      enemy.name.toLowerCase().includes(query)
    );
  }, [enemyCharacters, enemySearchQuery]);
  
  // --- Handler to add a selected player character ---
  const handleAddPlayer = (character: Character | null) => {
    if (!character) return; // Do nothing if null is selected
    
    // Add character if not already present
    setEditedCombat(prev => {
      const currentPlayers = prev.playerCharacters || [];
      if (!currentPlayers.some(p => p.id === character.id)) {
        return { ...prev, playerCharacters: [...currentPlayers, character] };
      }
      return prev; // Return previous state if already added
    });
    // Autocomplete value is null, so it should reset itself
  };
  
  // --- Handler to remove a player character ---
  const handleRemovePlayer = (characterId: string) => {
    setEditedCombat(prev => ({
      ...prev,
      playerCharacters: (prev.playerCharacters || []).filter(p => p.id !== characterId)
    }));
  };
  
  // Render the location dropdown using Autocomplete
  const renderLocationDropdown = () => (
    <Autocomplete<CustomLocation | null>
      options={locations}
      getOptionLabel={(option: CustomLocation | null) => option?.name || ''}
      value={locations.find(loc => loc.id === editedCombat.locationId) || null}
      onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: CustomLocation | null) => {
        handleFormChange('locationId', selectedOption?.id || null);
      }}
      isOptionEqualToValue={(option: CustomLocation | null, value: CustomLocation | null) => option?.id === value?.id}
      renderInput={(params: any) => (
        <TextField 
          {...params}
          label="Location"
          placeholder="Select a location" 
        />
      )}
    />
  );
  
  // Render the background music dropdown using Autocomplete
  const renderBackgroundMusicDropdown = () => (
    <Autocomplete<string | null>
      options={audioAssets}
      getOptionLabel={(option: string | null) => option || ''}
      value={editedCombat.backgroundMusic || null}
      onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
        handleFormChange('backgroundMusic', selectedOption || null);
      }}
      isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
      renderInput={(params: any) => (
        <TextField 
          {...params} 
          label="Background Music"
          placeholder="Select background music" 
        />
      )}
    />
  );
  
  // Render the entry sound dropdown using Autocomplete
  const renderEntrySoundDropdown = () => (
    <Autocomplete<string | null>
      options={audioAssets}
      getOptionLabel={(option: string | null) => option || ''}
      value={editedCombat.entrySound || null}
      onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
        handleFormChange('entrySound', selectedOption || null);
      }}
      isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
      renderInput={(params: any) => (
        <TextField 
          {...params} 
          label="Entry Sound"
          placeholder="Select entry sound" 
        />
      )}
    />
  );
  
  // Render the background image dropdown using Autocomplete
  const renderImageDropdown = () => (
    <Autocomplete<string | null>
      options={imageAssets}
      getOptionLabel={(option: string | null) => option || ''}
      value={editedCombat.backgroundImage || null}
      onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
        handleFormChange('backgroundImage', selectedOption || null);
      }}
      isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
      renderInput={(params: any) => (
        <TextField 
          {...params} 
          label="Background Image"
          placeholder="Select background image" 
        />
      )}
    />
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
          Combats
        </h1>
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button 
            startIcon={<AddIcon />}
            variant="contained" 
            color="primary"
            onPress={handleAddClick}
            className="btn-glow"
          >
            Add Combat
          </Button>
        </div>
      </div>
      
      {/* Floating search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex-grow w-full md:w-auto shadow-md rounded-xl">
          <CombatSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredCombats.length}
            totalCount={combats.length}
          />
        </div>
      </div>
      
      {/* Grid layout for combat cards */}
      <div className="mb-6">
        {filteredCombats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredCombats.map(combat => (
              <CombatCard
                key={combat.id}
                combat={combat}
                locations={locations}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-background-surface flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-4xl text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-text-secondary text-lg mb-6">
              {searchQuery ? 'No combats match your search' : 'No combats found. Create your first combat to get started.'}
            </p>
            <Button
              variant="contained"
              color="primary"
              onPress={handleAddClick}
              className="btn-glow"
            >
              Create Combat
            </Button>
          </div>
        )}
      </div>
      
      {/* Combat Form Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        title={selectedCombat ? `Edit Combat: ${selectedCombat.name}` : 'Add New Combat'}
      >
        <DialogTitle>{selectedCombat ? `Edit Combat: ${selectedCombat.name}` : 'Add New Combat'}</DialogTitle>
        <DialogContent>
          <Box className="pt-4 space-y-4">
            <TextField
              label="Name"
              fullWidth
              value={editedCombat.name || ''}
              onChange={(value) => handleFormChange('name', value)}
            />
            
            <TextField
              label="Description"
              fullWidth
              value={editedCombat.description || ''}
              onChange={(value) => handleFormChange('description', value)}
            />
            
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    isSelected={editedCombat.descriptionType === 'markdown'}
                    onChange={(isChecked) => handleFormChange('descriptionType', isChecked ? 'markdown' : 'plain')}
                  />
                }
                label="Format description as Markdown"
              />
            </FormControl>
            
            {/* Inlined Difficulty Dropdown */}
            <FormControl fullWidth className="mb-4">
              <InputLabel>Difficulty</InputLabel>
              <Select
                selectedKey={editedCombat.difficulty || 'medium'}
                onSelectionChange={(key) => handleFormChange('difficulty', key as CombatDifficulty)}
                label="Difficulty"
              >
                <SelectItem key="easy">Easy</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="hard">Hard</SelectItem>
                <SelectItem key="deadly">Deadly</SelectItem>
              </Select>
            </FormControl>
            
            {renderLocationDropdown()}
            {renderBackgroundMusicDropdown()}
            {renderEntrySoundDropdown()}
            {renderImageDropdown()}
            
            <Box className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Player Characters
              </Typography>
              <FormControl fullWidth>
                <Autocomplete
                  options={playerCharacters}
                  getOptionLabel={(option: Character) => option.name}
                  value={null}
                  onChange={(_event: React.ChangeEvent<{}> | null, value: Character | null) => handleAddPlayer(value)}
                  renderInput={(params: any) => (
                    <TextField {...params} label="Add Player Character" />
                  )}
                />
              </FormControl>
              
              {(editedCombat.playerCharacters && editedCombat.playerCharacters.length > 0) && (
                <List dense className="border rounded mt-2 max-h-40 overflow-y-auto">
                  {editedCombat.playerCharacters.map((player) => (
                    <ListItem key={player.id} divider>
                      <ListItemText primary={player.name} />
                      <IconButton 
                        edge="end" 
                        aria-label={`remove ${player.name}`}
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            <Box className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Enemies
              </Typography>
              
              <Box className="flex gap-2 mb-2">
                <Autocomplete
                  options={filteredEnemyCharacters}
                  getOptionLabel={(option: Character) => option.name}
                  onChange={(_event: React.ChangeEvent<{}> | null, value: Character | null) => {
                    if (value) {
                      handleAddEnemy(value.id, enemyCharacters);
                    }
                  }}
                  renderInput={(params: any) => (
                    <TextField {...params} label="Select an enemy to add" fullWidth />
                  )}
                  value={null}
                />
              </Box>
              
              <List className="border rounded">
                {enemyInstances.map((instance) => (
                  <ListItem key={instance.character.id} divider>
                    <ListItemText 
                      primary={instance.character.name}
                      secondary={`Count: ${instance.count}`}
                    />
                    <IconButton 
                      edge="end" 
                      aria-label="remove" 
                      onClick={() => handleRemoveEnemy(instance.character.id)}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </ListItem>
                ))}
                
                {enemyInstances.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No enemies added" />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box className="mb-4">
              <Box className="flex justify-between items-center mb-2">
                <Typography variant="subtitle1">
                  Rewards
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onPress={handleOpenAddRewardDialog}
                >
                  Add Reward
                </Button>
              </Box>
              
              <List className="border rounded">
                {editedCombat.rewards?.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText 
                      primary={item.name}
                      secondary={`Quantity: ${item.quantity}${item.price ? ` | Price: ${item.price}` : ''}`}
                    />
                    <Box>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleEditRewardClick(item.id)}
                      >
                        <EditIcon className="text-sm" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDeleteReward(item.id)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
                
                {(!editedCombat.rewards || editedCombat.rewards.length === 0) && (
                  <ListItem>
                    <ListItemText primary="No rewards added" />
                  </ListItem>
                )}
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onPress={handleCloseDialog}>
            Cancel
          </Button>
          <Button onPress={handleSave} color="primary" variant="contained" isDisabled={!editedCombat.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={cancelDelete}
        title="Confirm Deletion"
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this combat? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onPress={cancelDelete}>
            Cancel
          </Button>
          <Button onPress={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Reward Dialog */}
      <Dialog
        open={isAddRewardDialogOpen}
        onClose={() => setIsAddRewardDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        title="Add Reward Item"
      >
        <DialogTitle>Add Reward Item</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Name"
              fullWidth
              value={newRewardItem.name}
              onChange={(value) => setNewRewardItem({...newRewardItem, name: value})}
            />
            <TextField
              label="Description"
              fullWidth
              value={newRewardItem.description}
              onChange={(value) => setNewRewardItem({...newRewardItem, description: value})}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={String(newRewardItem.quantity)}
              onChange={(value) => setNewRewardItem({...newRewardItem, quantity: parseInt(value) || 1})}
            />
            <TextField
              label="Price (optional)"
              type="number"
              fullWidth
              value={newRewardItem.price !== undefined ? String(newRewardItem.price) : ''}
              onChange={(value) => setNewRewardItem({...newRewardItem, price: value ? parseInt(value) : undefined})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onPress={() => setIsAddRewardDialogOpen(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onPress={handleAddReward} variant="contained" color="primary" isDisabled={!newRewardItem.name}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Reward Item Dialog */}
      <Dialog
        open={isEditRewardDialogOpen}
        onClose={() => setIsEditRewardDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        title="Edit Reward Item"
      >
        <DialogTitle>Edit Reward Item</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Name"
              fullWidth
              value={newRewardItem.name}
              onChange={(value) => setNewRewardItem({...newRewardItem, name: value})}
            />
            <TextField
              label="Description"
              fullWidth
              value={newRewardItem.description}
              onChange={(value) => setNewRewardItem({...newRewardItem, description: value})}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={String(newRewardItem.quantity)}
              onChange={(value) => setNewRewardItem({...newRewardItem, quantity: parseInt(value) || 1})}
            />
            <TextField
              label="Price (optional)"
              type="number"
              fullWidth
              value={newRewardItem.price !== undefined ? String(newRewardItem.price) : ''}
              onChange={(value) => setNewRewardItem({...newRewardItem, price: value ? parseInt(value) : undefined})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onPress={() => setIsEditRewardDialogOpen(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onPress={handleSaveEditedReward} variant="contained" color="primary" isDisabled={!newRewardItem.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 