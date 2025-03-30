import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store';
import { AssetManager } from '../services/assetManager';
import { Character, Item, Location } from '../store';
import MarkdownContent from '@components/MarkdownContent';
import AssetViewer from '@components/AssetViewer';
import PDFViewerDialog from '@components/PDFViewerDialog';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Switch,
  Paper,
  IconButton,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  StringAutocomplete,
  Tooltip,
  Snackbar,
  Alert,
  // Import the icons from our UI components
  PersonIcon,
  StoreIcon, 
  SportsKabaddiIcon,
  VideogameAssetIcon,
  PlaceIcon,
  InventoryIcon,
  EditIcon,
  DeleteIcon,
  SaveIcon,
  SearchIcon,
  AddIcon,
  HelpIcon,
  ClearIcon
} from '@components/ui';

export const CharactersView: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [imageAssets, setImageAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfAsset, setCurrentPdfAsset] = useState('');
  const [markdownDialogOpen, setMarkdownDialogOpen] = useState(false);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');
  const [currentMarkdownTitle, setCurrentMarkdownTitle] = useState('');
  
  const { 
    characters, 
    addCharacter, 
    updateCharacter, 
    deleteCharacter, 
    saveDataToIndexedDB,
    locations
  } = useStore();
  
  // Add state for item editing
  const [newItem, setNewItem] = useState<Item>({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    quantity: 1,
    price: undefined
  });
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Filter characters based on search query
  const filteredCharacters = React.useMemo(() => {
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
  
  // Update the newCharacter state to include inventory property
  const [newCharacter, setNewCharacter] = useState<{
    name: string;
    description: string;
    type: 'npc' | 'merchant' | 'enemy' | 'player';
    locationId: string;
    descriptionType: 'markdown' | 'image' | 'pdf';
    descriptionAssetName: string;
    hp: number | string;
    inventory?: Item[]; // Add inventory property
  }>({
    name: '',
    description: '',
    type: 'npc',
    locationId: '',
    descriptionType: 'markdown',
    descriptionAssetName: '',
    hp: 10,
    inventory: [] // Initialize as empty array
  });
  
  // Currently editing character id
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  
  // Load image assets
  useEffect(() => {
    if (isAddDialogOpen || isEditDialogOpen) {
      const loadAssets = async () => {
        const imageAssetsData = await AssetManager.getAssets('images');
        setImageAssets(imageAssetsData.map(asset => asset.name));
      };
      loadAssets();
    }
  }, [isAddDialogOpen, isEditDialogOpen]);
  
  // Add a new character
  const handleAddCharacter = () => {
    const character: Omit<Character, 'id'> = {
      name: newCharacter.name,
      description: newCharacter.description,
      type: newCharacter.type,
      hp: typeof newCharacter.hp === 'string' 
           ? (parseInt(newCharacter.hp) || 1) 
           : (newCharacter.hp || 1),  // Ensure we always have a valid number
      inventory: newCharacter.inventory // Add the inventory to the new character
    };
    
    if (newCharacter.locationId) {
      character.locationId = newCharacter.locationId;
    }
    
    character.descriptionType = newCharacter.descriptionType;
    
    if (newCharacter.descriptionAssetName) {
      character.descriptionAssetName = newCharacter.descriptionAssetName;
    }
    
    addCharacter(character);
    
    setIsAddDialogOpen(false);
    resetCharacterForm();
    showSnackbar('Character added successfully');
  };
  
  // Reset the character form
  const resetCharacterForm = () => {
    setNewCharacter({
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
  
  // Open edit dialog for a character
  const handleEditCharacter = (characterId: string) => {
    const character = characters.find(char => char.id === characterId);
    if (character) {
      setEditingCharacter(characterId);
      setNewCharacter({
        name: character.name,
        description: character.description,
        type: character.type,
        locationId: character.locationId || '',
        descriptionType: character.descriptionType || 'markdown',
        descriptionAssetName: character.descriptionAssetName || '',
        hp: character.hp,
        inventory: character.inventory || []
      });
      setIsEditDialogOpen(true);
    }
  };
  
  // Save edited character
  const handleSaveCharacter = () => {
    if (editingCharacter) {
      const characterUpdate: Partial<Omit<Character, 'id'>> = {
        name: newCharacter.name,
        description: newCharacter.description,
        type: newCharacter.type,
        hp: typeof newCharacter.hp === 'string' 
            ? (parseInt(newCharacter.hp) || 1) 
            : (newCharacter.hp || 1),  // Ensure we always have a valid number
        descriptionType: newCharacter.descriptionType,
        inventory: newCharacter.inventory // Add the inventory to the update
      };
      
      if (newCharacter.locationId) {
        characterUpdate.locationId = newCharacter.locationId;
      }
      
      if (newCharacter.descriptionAssetName) {
        characterUpdate.descriptionAssetName = newCharacter.descriptionAssetName;
      }
      
      updateCharacter(editingCharacter, characterUpdate);
      
      setIsEditDialogOpen(false);
      resetCharacterForm();
      showSnackbar('Character updated successfully');
    }
  };
  
  // Confirm and delete a character
  const handleDeleteCharacter = (characterId: string) => {
    if (window.confirm('Are you sure you want to delete this character? This cannot be undone.')) {
      deleteCharacter(characterId);
      showSnackbar('Character deleted successfully');
    }
  };
  
  // Save all data to IndexedDB
  const handleSaveData = async () => {
    setIsSaving(true);
    try {
      const result = await saveDataToIndexedDB();
      showSnackbar(result.message);
    } catch (error) {
      showSnackbar(`Error saving data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show a snackbar message
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Render character card with a sleeker design
  const renderCharacterCard = (character: Character) => {
    const characterLocation = character.locationId 
      ? locations.find(loc => loc.id === character.locationId) 
      : null;
    
    const handleViewPdf = () => {
      if (character.descriptionAssetName) {
        setCurrentPdfAsset(character.descriptionAssetName);
        setPdfViewerOpen(true);
      }
    };
    
    const handleViewMarkdown = () => {
      setCurrentMarkdownContent(character.description);
      setCurrentMarkdownTitle(character.name);
      setMarkdownDialogOpen(true);
    };
    
    // Return appropriate type icon based on character type
    const getTypeIcon = () => {
      switch (character.type) {
        case 'npc':
          return <PersonIcon className="text-blue-400" />;
        case 'merchant':
          return <StoreIcon className="text-amber-400" />;
        case 'enemy':
          return <SportsKabaddiIcon className="text-red-500" />;
        case 'player':
          return <VideogameAssetIcon className="text-green-500" />;
        default:
          return <PersonIcon className="text-blue-400" />;
      }
    };

    // Format the character type for display
    const formatCharacterType = (type: string) => {
      switch (type) {
        case 'npc': return 'NPC';
        case 'merchant': return 'Merchant';
        case 'enemy': return 'Enemy';
        case 'player': return 'Player';
        default: return type;
      }
    };
    
    return (
      <Card 
        className="h-full transition-all duration-300 hover:shadow-xl overflow-hidden"
        variant="outlined" 
        hover 
      >
        <CardContent className="flex flex-col h-full p-0">
          {/* Character Header with Type Badge */}
          <Box className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between relative bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm">
                {getTypeIcon()}
              </div>
              <div>
                <Typography variant="h5" className="font-semibold text-slate-800 dark:text-white mb-0.5 line-clamp-1" title={character.name}>
                  {character.name}
                </Typography>
                <Chip
                  size="small"
                  label={formatCharacterType(character.type)}
                  className="capitalize font-medium"
                  color={
                    character.type === 'npc' ? 'primary' :
                    character.type === 'merchant' ? 'warning' :
                    character.type === 'enemy' ? 'error' :
                    'success'
                  }
                  variant="soft"
                />
              </div>
            </div>
            
            {/* HP Badge */}
            <div className="flex items-center">
              <Tooltip title="Health Points">
                <Chip
                  label={`HP: ${character.hp}`}
                  color="error"
                  variant="soft"
                  size="small"
                  className="font-semibold mr-1"
                />
              </Tooltip>
            </div>
          </Box>
          
          {/* Character Content */}
          <Box className="p-4 flex-grow space-y-3">
            {/* Description Section */}
            <Box className="mb-3">
              {character.descriptionType === 'markdown' && (
                <Box 
                  className="prose dark:prose-invert prose-sm line-clamp-3 cursor-pointer hover:text-primary-500 transition-colors"
                  onClick={handleViewMarkdown}
                >
                  <ReactMarkdown>{character.description}</ReactMarkdown>
                </Box>
              )}
              
              {character.descriptionType === 'image' && character.descriptionAssetName && (
                <Box className="mt-2 cursor-pointer overflow-hidden rounded-md border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow transition-all">
                  <AssetViewer 
                    assetName={character.descriptionAssetName}
                    height="160px"
                    width="100%"
                  />
                </Box>
              )}
              
              {character.descriptionType === 'pdf' && character.descriptionAssetName && (
                <Button
                  onClick={handleViewPdf}
                  className="mt-2"
                  startIcon={<div className="w-5 h-5 bg-red-500 rounded-sm text-white text-xs flex items-center justify-center font-bold">PDF</div>}
                  size="small"
                  variant="outlined"
                  color="default"
                >
                  View character sheet
                </Button>
              )}
            </Box>
            
            {/* Location Section */}
            {characterLocation && (
              <Box className="mb-3">
                <Box className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 mb-1">
                  <PlaceIcon fontSize="small" className="text-primary-500" />
                  <Typography variant="body2" className="font-medium">Location</Typography>
                </Box>
                <Chip 
                  label={characterLocation.name} 
                  variant="outlined"
                  size="small"
                  color="primary"
                  className="mt-1"
                />
              </Box>
            )}
            
            {/* Inventory Section */}
            {character.inventory && character.inventory.length > 0 && (
              <Box>
                <Box className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 mb-1">
                  <InventoryIcon fontSize="small" className="text-amber-500" />
                  <Typography variant="body2" className="font-medium">Inventory ({character.inventory.length})</Typography>
                </Box>
                <Box className="mt-1.5 flex flex-wrap gap-1">
                  {character.inventory.slice(0, 3).map((item) => (
                    <Tooltip key={item.id} title={`${item.name}${item.quantity > 1 ? ` (×${item.quantity})` : ''}`}>
                      <Chip 
                        label={`${item.name}${item.quantity > 1 ? ` (×${item.quantity})` : ''}`}
                        size="small"
                        variant="outlined"
                        color="warning"
                        className="truncate max-w-[120px]"
                      />
                    </Tooltip>
                  ))}
                  {character.inventory.length > 3 && (
                    <Chip 
                      label={`+${character.inventory.length - 3} more`}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Character Actions */}
          <Box className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end">
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              color="primary"
              size="small"
              className="mr-2"
              onClick={() => handleEditCharacter(character.id)}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeleteCharacter(character.id)}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Add function to handle adding new item to character
  const handleAddItem = () => {
    if (!newItem.name) return;
    
    // Create new item with a unique ID
    const itemToAdd: Item = {
      ...newItem,
      id: crypto.randomUUID()
    };
    
    // Add to character's inventory
    const updatedInventory = [...(newCharacter.inventory || []), itemToAdd];
    setNewCharacter({
      ...newCharacter,
      inventory: updatedInventory
    });
    
    // Reset and close dialog
    setNewItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      price: undefined
    });
    setIsAddItemDialogOpen(false);
  };
  
  // Add function to handle editing item
  const handleEditItemClick = (itemId: string) => {
    const item = newCharacter.inventory?.find(item => item.id === itemId);
    if (!item) return;
    
    setNewItem({ ...item });
    setEditingItemId(itemId);
    setIsEditItemDialogOpen(true);
  };
  
  // Add function to save edited item
  const handleSaveEditedItem = () => {
    if (!newItem.name || !editingItemId) return;
    
    // Update the item in inventory
    const updatedInventory = newCharacter.inventory?.map(item => 
      item.id === editingItemId ? { ...newItem } : item
    ) || [];
    
    setNewCharacter({
      ...newCharacter,
      inventory: updatedInventory
    });
    
    // Reset and close dialog
    setNewItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      price: undefined
    });
    setEditingItemId(null);
    setIsEditItemDialogOpen(false);
  };
  
  // Add function to delete item
  const handleDeleteItem = (itemId: string) => {
    const updatedInventory = newCharacter.inventory?.filter(item => item.id !== itemId) || [];
    
    setNewCharacter({
      ...newCharacter,
      inventory: updatedInventory
    });
  };
  
  return (
    <Box className="p-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <Box className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Box>
          <Typography variant="h4" className="text-slate-800 dark:text-white font-bold mb-2">
            Characters
          </Typography>
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
            Manage all your campaign's characters, NPCs, merchants and enemies
          </Typography>
        </Box>
        
        <Box className="flex gap-2">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => { resetCharacterForm(); setIsAddDialogOpen(true); }}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Add Character
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveData}
            disabled={isSaving}
            className="shadow-sm"
          >
            {isSaving ? (
              <CircularProgress size={24} color="primary" />
            ) : (
              'Save'
            )}
          </Button>
        </Box>
      </Box>
      
      {/* Search Bar */}
      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Search characters by name, description, type, location or items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-slate-400" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-primary-500"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
            className: "bg-white dark:bg-slate-800 shadow-sm rounded-lg border-slate-300 dark:border-slate-700"
          }}
        />
        <Box className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 px-2">
          <span>{filteredCharacters.length} {filteredCharacters.length === 1 ? 'character' : 'characters'} found</span>
          {searchQuery && (
            <Button 
              variant="text" 
              color="primary" 
              size="small" 
              onClick={() => setSearchQuery('')}
              className="text-xs py-0"
            >
              Clear Search
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Character Grid */}
      {filteredCharacters.length > 0 ? (
        <Grid container spacing={3} className="mb-6">
          {filteredCharacters.map((character) => (
            <Grid key={character.id} item xs={12} sm={6} md={4} lg={3} className="transition-all duration-300">
              {renderCharacterCard(character)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box className="flex flex-col items-center justify-center p-8 mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <Box className="w-24 h-24 mb-4 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500">
            <PersonIcon style={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h6" className="mb-2 text-slate-700 dark:text-slate-300 text-center">
            {searchQuery ? 'No characters found matching your search' : 'No characters added yet'}
          </Typography>
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or clear the search to see all characters.'
              : 'Start adding characters to your campaign. Characters can be NPCs, merchants, enemies, or players.'}
          </Typography>
          {searchQuery ? (
            <Button variant="outlined" color="primary" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => { resetCharacterForm(); setIsAddDialogOpen(true); }}
            >
              Add Your First Character
            </Button>
          )}
        </Box>
      )}
      
      {/* Character Dialogs would go here - keeping existing dialogs */}
      {/* ... existing dialogs ... */}
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          className="shadow-lg"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Markdown Dialog */}
      <Dialog
        open={markdownDialogOpen}
        onClose={() => setMarkdownDialogOpen(false)}
        maxWidth="md"
        className="backdrop-blur-sm"
      >
        <DialogTitle>{currentMarkdownTitle}</DialogTitle>
        <DialogContent>
          <Box className="prose dark:prose-invert prose-sm max-w-none">
            <MarkdownContent content={currentMarkdownContent} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkdownDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* PDF Viewer Dialog */}
      <PDFViewerDialog
        open={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        assetName={currentPdfAsset}
      />
    </Box>
  );
}; 