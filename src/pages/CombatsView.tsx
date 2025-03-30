import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Combat, Character, Item, CustomLocation } from '../store';
import { 
  AddIcon, 
  SearchIcon, 
  ClearIcon, 
  EditIcon, 
  DeleteIcon,
  SaveIcon,
  Star,
  RemoveIcon
} from '../assets/icons';
import { 
  Box, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  Chip, 
  CircularProgress,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Autocomplete,
  ButtonGroup,
  Checkbox
} from '@components/ui';
import MarkdownContent from '@components/MarkdownContent';
import AssetViewer from '@components/AssetViewer';
import { AssetManager } from '../services/assetManager';

// Interface for enemy instances with count
interface EnemyInstance {
  character: Character;
  count: number;
}

export const CombatsView: React.FC = () => {
  const { combats, characters, locations, addCombat, updateCombat, deleteCombat } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCombat, setSelectedCombat] = useState<Combat | null>(null);
  const [audioAssets, setAudioAssets] = useState<string[]>([]);
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  const [enemyInstances, setEnemyInstances] = useState<EnemyInstance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editedCombat, setEditedCombat] = useState<Partial<Combat>>({
    name: '',
    description: '',
    descriptionType: 'markdown',
    playerCharacters: [],
    enemies: [],
    difficulty: 'medium',
  });

  // Add state for reward item management
  const [newRewardItem, setNewRewardItem] = useState<Item>({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    quantity: 1,
    price: undefined
  });
  const [isAddRewardDialogOpen, setIsAddRewardDialogOpen] = useState(false);
  const [isEditRewardDialogOpen, setIsEditRewardDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  
  // Filter combats based on search query
  const filteredCombats = React.useMemo(() => {
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
  const playerCharacters = characters.filter(char => char.type === 'player');
  const enemyCharacters = characters.filter(char => char.type === 'enemy');

  // Load audio assets when the dialog opens
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

  // Initialize enemy instances when the dialog opens or when editing a combat
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
    } else if (isDialogOpen && !selectedCombat) {
      // Reset for new combat
      setEnemyInstances([]);
    }
  }, [isDialogOpen, selectedCombat]);

  const handleAddClick = () => {
    setSelectedCombat(null);
    setEditedCombat({
      name: '',
      description: '',
      descriptionType: 'markdown',
      playerCharacters: [],
      enemies: [],
      difficulty: 'medium',
    });
    setEnemyInstances([]);
    setIsDialogOpen(true);
  };

  const handleEditClick = (combat: Combat) => {
    setSelectedCombat(combat);
    setEditedCombat({ ...combat });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (combatId: string) => {
    if (window.confirm('Are you sure you want to delete this combat?')) {
      deleteCombat(combatId);
    }
  };

  const handleSave = () => {
    if (!editedCombat.name) {
      alert('Please fill in all required fields');
      return;
    }

    // Expand enemy instances into flat array of enemies
    let expandedEnemies: Character[] = [];
    enemyInstances.forEach(instance => {
      for (let i = 0; i < instance.count; i++) {
        expandedEnemies.push(instance.character);
      }
    });

    const updatedCombat = {
      ...editedCombat,
      enemies: expandedEnemies
    };

    if (selectedCombat) {
      // Update existing combat
      updateCombat(selectedCombat.id, updatedCombat);
    } else {
      // Add new combat
      addCombat(updatedCombat as Omit<Combat, 'id'>);
    }

    setIsDialogOpen(false);
  };

  const handleCharacterSelection = (characterIds: string[], field: 'playerCharacters' | 'enemies') => {
    if (field === 'playerCharacters') {
      const selectedCharacters = characters.filter(char => characterIds.includes(char.id));
      setEditedCombat(prev => ({
        ...prev,
        playerCharacters: selectedCharacters
      }));
    }
  };

  const handleAddEnemy = (enemyId: string) => {
    const enemy = enemyCharacters.find(char => char.id === enemyId);
    if (!enemy) return;
    
    // Check if the enemy is already in instances
    const existingIndex = enemyInstances.findIndex(instance => instance.character.id === enemyId);
    
    if (existingIndex >= 0) {
      // Increment count for existing enemy
      const updatedInstances = [...enemyInstances];
      updatedInstances[existingIndex] = {
        ...updatedInstances[existingIndex],
        count: updatedInstances[existingIndex].count + 1
      };
      setEnemyInstances(updatedInstances);
    } else {
      // Add new enemy instance
      setEnemyInstances([...enemyInstances, { character: enemy, count: 1 }]);
    }
  };

  const handleRemoveEnemy = (enemyId: string) => {
    const existingIndex = enemyInstances.findIndex(instance => instance.character.id === enemyId);
    
    if (existingIndex >= 0) {
      const updatedInstances = [...enemyInstances];
      
      if (updatedInstances[existingIndex].count > 1) {
        // Decrement count
        updatedInstances[existingIndex] = {
          ...updatedInstances[existingIndex],
          count: updatedInstances[existingIndex].count - 1
        };
      } else {
        // Remove the instance completely
        updatedInstances.splice(existingIndex, 1);
      }
      
      setEnemyInstances(updatedInstances);
    }
  };

  // Function to handle adding a new reward item
  const handleAddReward = () => {
    if (!newRewardItem.name) return;
    
    // Create new item with a unique ID
    const itemToAdd: Item = {
      ...newRewardItem,
      id: crypto.randomUUID()
    };
    
    // Add to combat rewards
    const updatedRewards = [...(editedCombat.rewards || []), itemToAdd];
    setEditedCombat(prev => ({
      ...prev,
      rewards: updatedRewards
    }));
    
    // Reset and close dialog
    setNewRewardItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      price: undefined
    });
    setIsAddRewardDialogOpen(false);
  };
  
  // Function to handle editing a reward item
  const handleEditRewardClick = (itemId: string) => {
    const item = editedCombat.rewards?.find(item => item.id === itemId);
    if (!item) return;
    
    setNewRewardItem({ ...item });
    setEditingRewardId(itemId);
    setIsEditRewardDialogOpen(true);
  };
  
  // Function to save edited reward item
  const handleSaveEditedReward = () => {
    if (!newRewardItem.name || !editingRewardId) return;
    
    // Update the item in rewards
    const updatedRewards = editedCombat.rewards?.map(item => 
      item.id === editingRewardId ? { ...newRewardItem } : item
    ) || [];
    
    setEditedCombat(prev => ({
      ...prev,
      rewards: updatedRewards
    }));
    
    // Reset and close dialog
    setNewRewardItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      price: undefined
    });
    setEditingRewardId(null);
    setIsEditRewardDialogOpen(false);
  };
  
  // Function to delete a reward item
  const handleDeleteReward = (itemId: string) => {
    const updatedRewards = editedCombat.rewards?.filter(item => item.id !== itemId) || [];
    
    setEditedCombat(prev => ({
      ...prev,
      rewards: updatedRewards
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Combat Encounters</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Combat
        </Button>
      </Box>
      
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search combats by name, description, players, enemies, difficulty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton 
                  aria-label="clear search" 
                  onClick={() => setSearchQuery('')}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {filteredCombats.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          {combats.length === 0 ? (
            <>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Combat Encounters Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Add your first combat encounter to get started.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />} 
                onClick={handleAddClick}
              >
                Add Combat
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Combats Found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Try adjusting your search terms.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCombats.map((combat) => (
            <Grid item xs={12} md={6} key={combat.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {combat.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Difficulty: {combat.difficulty || 'Not set'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {combat.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Players ({combat.playerCharacters.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {combat.playerCharacters.map(pc => (
                            <Chip
                              key={pc.id}
                              label={`${pc.name} (HP: ${pc.hp})`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                          {combat.playerCharacters.length === 0 && (
                            <Typography variant="body2" color="text.secondary">No player characters assigned</Typography>
                          )}
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Enemies ({combat.enemies.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {/* Group enemies by ID for display */}
                          {Object.entries(combat.enemies.reduce((acc, enemy) => {
                            acc[enemy.id] = (acc[enemy.id] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)).map(([id, count]) => {
                            const enemy = combat.enemies.find(e => e.id === id);
                            return enemy ? (
                              <Chip
                                key={id}
                                label={`${enemy.name} ${count > 1 ? `(${count}) ` : ''}(HP: ${enemy.hp})`}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            ) : null;
                          })}
                          {combat.enemies.length === 0 && (
                            <Typography variant="body2" color="text.secondary">No enemies assigned</Typography>
                          )}
                        </Box>
                        
                        {/* Add rewards indicator */}
                        {combat.rewards && combat.rewards.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ color: 'gold', fontSize: '1rem', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              Rewards: {combat.rewards.length} item{combat.rewards.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleEditClick(combat)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(combat.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCombat ? 'Edit Combat' : 'New Combat'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editedCombat.name || ''}
              onChange={(e) => setEditedCombat(prev => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editedCombat.description || ''}
              onChange={(e) => setEditedCombat(prev => ({ ...prev, description: e.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel>Description Type</InputLabel>
              <Select
                value={editedCombat.descriptionType || 'markdown'}
                label="Description Type"
                onChange={(e) => setEditedCombat(prev => ({ ...prev, descriptionType: e.target.value as 'markdown' | 'image' | 'pdf' }))}
              >
                <MenuItem value="markdown">Markdown</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>

            {editedCombat.descriptionType !== 'markdown' && (
              <Autocomplete
                options={imageAssets}
                value={editedCombat.descriptionAssetName || null}
                onChange={(_, newValue) => setEditedCombat(prev => ({ ...prev, descriptionAssetName: newValue || undefined }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Description Asset"
                    helperText="Select an image or PDF file from assets"
                  />
                )}
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Player Characters</InputLabel>
              <Select
                multiple
                value={(editedCombat.playerCharacters || []).map(pc => pc.id)}
                label="Player Characters"
                onChange={(e) => handleCharacterSelection(e.target.value as string[], 'playerCharacters')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const character = playerCharacters.find(c => c.id === id);
                      return character ? (
                        <Chip 
                          key={id} 
                          label={character.name} 
                          size="small" 
                          color="success"
                        />
                      ) : null;
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                    },
                  },
                }}
              >
                {playerCharacters.map((character) => (
                  <MenuItem key={character.id} value={character.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{character.name}</span>
                      <Typography variant="body2" color="text.secondary">
                        HP: {character.hp}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
                {playerCharacters.length === 0 && (
                  <MenuItem disabled>
                    No player characters available. Add some first.
                  </MenuItem>
                )}
              </Select>
              <Typography variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                Select multiple player characters (hold Ctrl/Cmd to select multiple)
              </Typography>
            </FormControl>

            {/* Enemies Section with Add/Remove functionality */}
            <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Enemies
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Autocomplete
                  options={enemyCharacters}
                  getOptionLabel={(character) => character.name}
                  renderOption={(props, character) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{character.name}</span>
                        <Typography variant="body2" color="text.secondary">
                          HP: {character.hp}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Add Enemy"/>
                  )}
                  onChange={(_, character) => {
                    if (character) {
                      handleAddEnemy(character.id);
                    }
                  }}
                  value={null}
                  noOptionsText="No enemy characters available. Add some first."
                />
              </FormControl>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Current Enemies:
              </Typography>
              
              {enemyInstances.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No enemies added to this combat. Select enemies above.
                </Typography>
              ) : (
                <List>
                  {enemyInstances.map((instance, index) => (
                    <ListItem key={index} divider={index < enemyInstances.length - 1}>
                      <ListItemText 
                        primary={instance.character.name} 
                        secondary={`HP: ${instance.character.hp}`} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          Quantity: {instance.count}
                        </Typography>
                        <ButtonGroup size="small">
                          <Button 
                            onClick={() => handleAddEnemy(instance.character.id)}
                            color="primary"
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                          <Button 
                            onClick={() => handleRemoveEnemy(instance.character.id)}
                            color="error"
                          >
                            <RemoveIcon fontSize="small" />
                          </Button>
                        </ButtonGroup>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Rewards Section */}
            <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rewards (Loot)
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
                Items that will be available as loot after the combat is completed
              </Typography>
              
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewRewardItem({
                    id: crypto.randomUUID(),
                    name: '',
                    description: '',
                    quantity: 1,
                    price: undefined
                  });
                  setIsAddRewardDialogOpen(true);
                }}
                sx={{ mb: 2 }}
              >
                Add Reward Item
              </Button>
              
              {(!editedCombat.rewards || editedCombat.rewards.length === 0) ? (
                <Typography variant="body2" color="text.secondary">
                  No reward items added. Combat will not drop any loot.
                </Typography>
              ) : (
                <List>
                  {editedCombat.rewards.map((item) => (
                    <ListItem 
                      key={item.id}
                      divider
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleEditRewardClick(item.id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteReward(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText 
                        primary={item.name}
                        secondary={
                          <>
                            {item.description}
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" component="span">
                                Quantity: {item.quantity}
                              </Typography>
                              {item.price !== undefined && (
                                <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                                  Price: {item.price}
                                </Typography>
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={editedCombat.difficulty || 'medium'}
                label="Difficulty"
                onChange={(e) => setEditedCombat(prev => ({ ...prev, difficulty: e.target.value as Combat['difficulty'] }))}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              options={locations}
              value={locations.find(loc => loc.id === editedCombat.locationId) || null}
              onChange={(_, newValue) => setEditedCombat(prev => ({ 
                ...prev, 
                locationId: newValue?.id || undefined 
              }))}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  helperText="Select a location for this combat"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              options={audioAssets}
              value={editedCombat.entrySound || null}
              onChange={(_, newValue) => setEditedCombat(prev => ({ ...prev, entrySound: newValue || undefined }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Entry Sound"
                  helperText="Select an audio file from assets"
                />
              )}
            />

            <Autocomplete
              options={audioAssets}
              value={editedCombat.backgroundMusic || null}
              onChange={(_, newValue) => setEditedCombat(prev => ({ ...prev, backgroundMusic: newValue || undefined }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Background Music"
                  helperText="Select an audio file from assets"
                />
              )}
            />

            <Autocomplete
              options={imageAssets}
              value={editedCombat.backgroundImage || null}
              onChange={(_, newValue) => setEditedCombat(prev => ({ ...prev, backgroundImage: newValue || undefined }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Background Image"
                  helperText="Select an image file from assets"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Reward Dialog */}
      <Dialog open={isAddRewardDialogOpen} onClose={() => setIsAddRewardDialogOpen(false)}>
        <DialogTitle>Add Reward Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Item Name"
                fullWidth
                value={newRewardItem.name}
                onChange={(e) => setNewRewardItem({ ...newRewardItem, name: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newRewardItem.description}
                onChange={(e) => setNewRewardItem({ ...newRewardItem, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Quantity"
                fullWidth
                type="number"
                value={newRewardItem.quantity}
                onChange={(e) => setNewRewardItem({ 
                  ...newRewardItem, 
                  quantity: parseInt(e.target.value) || 1 
                })}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={newRewardItem.price !== undefined} 
                    onChange={(e) => {
                      setNewRewardItem({
                        ...newRewardItem,
                        price: e.target.checked ? 0 : undefined
                      });
                    }}
                  />
                }
                label="Has Price"
              />
              
              {newRewardItem.price !== undefined && (
                <TextField
                  label="Price"
                  fullWidth
                  type="number"
                  value={newRewardItem.price}
                  onChange={(e) => setNewRewardItem({ 
                    ...newRewardItem, 
                    price: parseInt(e.target.value) || 0 
                  })}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddRewardDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddReward} 
            variant="contained"
            disabled={!newRewardItem.name}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Reward Dialog */}
      <Dialog open={isEditRewardDialogOpen} onClose={() => setIsEditRewardDialogOpen(false)}>
        <DialogTitle>Edit Reward Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Item Name"
                fullWidth
                value={newRewardItem.name}
                onChange={(e) => setNewRewardItem({ ...newRewardItem, name: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newRewardItem.description}
                onChange={(e) => setNewRewardItem({ ...newRewardItem, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Quantity"
                fullWidth
                type="number"
                value={newRewardItem.quantity}
                onChange={(e) => setNewRewardItem({ 
                  ...newRewardItem, 
                  quantity: parseInt(e.target.value) || 1 
                })}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={newRewardItem.price !== undefined} 
                    onChange={(e) => {
                      setNewRewardItem({
                        ...newRewardItem,
                        price: e.target.checked ? 0 : undefined
                      });
                    }}
                  />
                }
                label="Has Price"
              />
              
              {newRewardItem.price !== undefined && (
                <TextField
                  label="Price"
                  fullWidth
                  type="number"
                  value={newRewardItem.price}
                  onChange={(e) => setNewRewardItem({ 
                    ...newRewardItem, 
                    price: parseInt(e.target.value) || 0 
                  })}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditRewardDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEditedReward} 
            variant="contained"
            disabled={!newRewardItem.name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 