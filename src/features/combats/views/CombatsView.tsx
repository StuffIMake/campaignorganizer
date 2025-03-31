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
  MenuItem,
  TextField,
  Select,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  IconButton,
  Autocomplete
} from '../../../components/ui';
import { AddIcon, RemoveIcon } from '../../../assets/icons';
import { CombatSearch, CombatCard } from '../components';
import { useCombats, useCombatForm, EnemyInstance } from '../hooks';
import { Combat, Item, Character } from '../../../store';
import { Combobox } from '@headlessui/react';

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
  
  // Render the location dropdown
  const renderLocationDropdown = () => (
    <Box className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Location
      </label>
      <Combobox
        value={editedCombat.locationId || ''}
        onChange={(value: string) => handleFormChange('locationId', value)}
      >
        <div className="relative w-full">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setLocationSearchQuery(e.target.value)}
            displayValue={(locationId: string) => 
              locations.find(loc => loc.id === locationId)?.name || 'Select a location'
            }
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          <Combobox.Option value="">
            {({ active }) => (
              <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                No Location
              </div>
            )}
          </Combobox.Option>
          {filteredLocations.map((location) => (
            <Combobox.Option key={location.id} value={location.id}>
              {({ active }) => (
                <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                  {location.name}
                </div>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </Box>
  );
  
  // Render the background music dropdown
  const renderBackgroundMusicDropdown = () => (
    <Box className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Background Music
      </label>
      <Combobox
        value={editedCombat.backgroundMusic || ''}
        onChange={(value: string) => handleFormChange('backgroundMusic', value)}
      >
        <div className="relative w-full">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setBgMusicSearchQuery(e.target.value)}
            displayValue={(value: string) => value || 'No background music'}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          <Combobox.Option value="">
            {({ active }) => (
              <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                No background music
              </div>
            )}
          </Combobox.Option>
          {filteredBgMusicAssets.map((asset) => (
            <Combobox.Option key={asset} value={asset}>
              {({ active }) => (
                <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                  {asset}
                </div>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </Box>
  );
  
  // Render the entry sound dropdown
  const renderEntrySoundDropdown = () => (
    <Box className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Entry Sound
      </label>
      <Combobox
        value={editedCombat.entrySound || ''}
        onChange={(value: string) => handleFormChange('entrySound', value)}
      >
        <div className="relative w-full">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setEntrySoundSearchQuery(e.target.value)}
            displayValue={(value: string) => value || 'No entry sound'}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          <Combobox.Option value="">
            {({ active }) => (
              <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                No entry sound
              </div>
            )}
          </Combobox.Option>
          {filteredEntrySoundAssets.map((asset) => (
            <Combobox.Option key={asset} value={asset}>
              {({ active }) => (
                <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                  {asset}
                </div>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </Box>
  );
  
  // Render the background image dropdown
  const renderImageDropdown = () => (
    <Box className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Background Image
      </label>
      <Combobox
        value={editedCombat.backgroundImage || ''}
        onChange={(value: string) => handleFormChange('backgroundImage', value)}
      >
        <div className="relative w-full">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setImageSearchQuery(e.target.value)}
            displayValue={(value: string) => value || 'No background image'}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          <Combobox.Option value="">
            {({ active }) => (
              <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                No background image
              </div>
            )}
          </Combobox.Option>
          {filteredImageAssets.map((asset) => (
            <Combobox.Option key={asset} value={asset}>
              {({ active }) => (
                <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-primary-500 text-white' : ''}`}>
                  {asset}
                </div>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </Box>
  );
  
  // Render the difficulty dropdown
  const renderDifficultyDropdown = () => (
    <FormControl fullWidth className="mb-4">
      <InputLabel>Difficulty</InputLabel>
      <Select
        value={editedCombat.difficulty || 'medium'}
        onChange={(e) => handleFormChange('difficulty', e.target.value)}
        label="Difficulty"
      >
        <MenuItem value="easy">Easy</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="hard">Hard</MenuItem>
        <MenuItem value="deadly">Deadly</MenuItem>
      </Select>
    </FormControl>
  );
  
  return (
    <div className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Combats
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Combat
        </Button>
      </Box>
      
      <CombatSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        resultsCount={filteredCombats.length}
        totalCount={combats.length}
      />
      
      <Grid container spacing={3}>
        {filteredCombats.map(combat => (
          <Grid item xs={12} sm={6} md={4} key={combat.id}>
            <CombatCard
              combat={combat}
              locations={locations}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          </Grid>
        ))}
        
        {filteredCombats.length === 0 && (
          <Grid item xs={12}>
            <Box className="text-center p-8 bg-gray-800/30 rounded-lg">
              <Typography variant="h6">
                {searchQuery ? 'No combats match your search' : 'No combats found'}
              </Typography>
              <Typography variant="body2" className="mt-2 text-gray-400">
                {searchQuery ? 'Try a different search term' : 'Click "Add Combat" to create your first combat'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Combat Form Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCombat ? `Edit Combat: ${selectedCombat.name}` : 'Add New Combat'}
        </DialogTitle>
        <DialogContent>
          <Box className="pt-4 space-y-4">
            <TextField
              label="Name"
              fullWidth
              value={editedCombat.name || ''}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editedCombat.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
            
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedCombat.descriptionType === 'markdown'}
                    onChange={(e) => handleFormChange('descriptionType', e.target.checked ? 'markdown' : 'plain')}
                  />
                }
                label="Format description as Markdown"
              />
            </FormControl>
            
            {renderDifficultyDropdown()}
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
                  multiple
                  options={playerCharacters}
                  getOptionLabel={(option) => option.name}
                  value={editedCombat.playerCharacters || []}
                  onChange={(e, value) => handleFormChange('playerCharacters', value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Players" />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                      />
                    ))
                  }
                />
              </FormControl>
            </Box>
            
            <Box className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Enemies
              </Typography>
              
              <Box className="flex gap-2 mb-2">
                <Autocomplete
                  options={filteredEnemyCharacters}
                  getOptionLabel={(option) => option.name}
                  onChange={(e, value) => {
                    if (value) {
                      handleAddEnemy(value.id, enemyCharacters);
                    }
                  }}
                  renderInput={(params) => (
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
                  onClick={handleOpenAddRewardDialog}
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
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained" disabled={!editedCombat.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this combat? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
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
      >
        <DialogTitle>Add Reward Item</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Name"
              fullWidth
              value={newRewardItem.name}
              onChange={(e) => setNewRewardItem({...newRewardItem, name: e.target.value})}
            />
            <TextField
              label="Description"
              fullWidth
              value={newRewardItem.description}
              onChange={(e) => setNewRewardItem({...newRewardItem, description: e.target.value})}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={newRewardItem.quantity}
              onChange={(e) => setNewRewardItem({...newRewardItem, quantity: parseInt(e.target.value) || 1})}
            />
            <TextField
              label="Price (optional)"
              type="number"
              fullWidth
              value={newRewardItem.price || ''}
              onChange={(e) => setNewRewardItem({...newRewardItem, price: e.target.value ? parseInt(e.target.value) : undefined})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddRewardDialogOpen(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddReward} variant="contained" color="primary" disabled={!newRewardItem.name}>
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
      >
        <DialogTitle>Edit Reward Item</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Name"
              fullWidth
              value={newRewardItem.name}
              onChange={(e) => setNewRewardItem({...newRewardItem, name: e.target.value})}
            />
            <TextField
              label="Description"
              fullWidth
              value={newRewardItem.description}
              onChange={(e) => setNewRewardItem({...newRewardItem, description: e.target.value})}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={newRewardItem.quantity}
              onChange={(e) => setNewRewardItem({...newRewardItem, quantity: parseInt(e.target.value) || 1})}
            />
            <TextField
              label="Price (optional)"
              type="number"
              fullWidth
              value={newRewardItem.price || ''}
              onChange={(e) => setNewRewardItem({...newRewardItem, price: e.target.value ? parseInt(e.target.value) : undefined})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditRewardDialogOpen(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveEditedReward} variant="contained" color="primary" disabled={!newRewardItem.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 