import React, { useState, useEffect, useMemo } from 'react';
import { 
  Button, 
  Paper, 
  Grid,
  Snackbar, 
  IconButton,
  Typography 
} from '../../../components/ui';
import { 
  AddIcon, 
  SaveIcon, 
  CloseIcon,
  SearchIcon,
  ExpandLessIcon as GridViewIcon,
  ExpandMoreIcon as ListViewIcon,
  PersonIcon
} from '../../../assets/icons';
import { 
  CharacterCard as CharacterItem, 
  CharacterSearch, 
  CharacterFormDialog,
  ItemFormDialog,
  AssetViewerDialog
} from '../components';
import { 
  useCharacters, 
  useCharacterForm, 
  useItemForm, 
  useAssetViewer,
  useNotifications 
} from '../hooks';
import { Character } from '../../../store';

// Define the CharacterFormData interface to match what's in the hook
interface CharacterFormData {
  name: string;
  description: string;
  type: 'npc' | 'merchant' | 'enemy' | 'player';
  locationId: string;
  descriptionType: 'markdown' | 'image' | 'pdf';
  descriptionAssetName: string;
  hp: number | string;
  inventory?: any[];
}

export const CharactersView: React.FC = () => {
  // View options state
  const [isGridView, setIsGridView] = useState(true);
  const [expandedCharacters, setExpandedCharacters] = useState<Record<string, boolean>>({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const { 
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
  } = useCharacters();

  const { 
    showNotification, 
    hideNotification, 
    snackbarOpen, 
    snackbarMessage 
  } = useNotifications();

  const {
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
  } = useCharacterForm(
    (characterData) => {
      addCharacter(characterData);
      showNotification('Character added successfully');
    },
    (id, characterData) => {
      updateCharacter(id, characterData);
      showNotification('Character updated successfully');
    }
  );

  const {
    pdfViewerOpen,
    currentPdfAsset,
    markdownDialogOpen,
    currentMarkdownContent,
    currentMarkdownTitle,
    viewPdf,
    viewMarkdown,
    closeAssetViewer
  } = useAssetViewer();

  // State for managing the inventory for the currently edited character
  const [editingInventoryCharacterId, setEditingInventoryCharacterId] = useState<string | null>(null);
  
  // Find the character whose inventory we're editing
  const characterWithInventory = editingInventoryCharacterId 
    ? characters.find(char => char.id === editingInventoryCharacterId) 
    : null;
  
  const {
    newItem,
    handleItemChange,
    isAddItemDialogOpen,
    setIsAddItemDialogOpen,
    isEditItemDialogOpen,
    setIsEditItemDialogOpen,
    editingItemId,
    handleAddItem: handleAddInventoryItem,  // Renamed to avoid conflict
    handleEditItemClick,
    handleSaveEditedItem,
    handleDeleteItem,
    resetItemForm
  } = useItemForm(
    characterWithInventory?.inventory || [],
    (updatedInventory) => {
      if (editingInventoryCharacterId) {
        updateCharacter(editingInventoryCharacterId, { inventory: updatedInventory });
      }
    }
  );

  // Load image assets when forms are opened
  useEffect(() => {
    if (isAddDialogOpen || isEditDialogOpen) {
      loadImageAssets();
    }
  }, [isAddDialogOpen, isEditDialogOpen, loadImageAssets]);

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchActive(query.length > 0);
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      deleteCharacter(characterId);
      showNotification('Character deleted successfully');
      
      // Remove character from expanded state if it was expanded
      if (expandedCharacters[characterId]) {
        const newExpandedCharacters = { ...expandedCharacters };
        delete newExpandedCharacters[characterId];
        setExpandedCharacters(newExpandedCharacters);
      }
    }
  };

  const handleSaveData = async () => {
    const result = await saveData();
    showNotification(result.message);
  };

  const handleViewAsset = (character: Character) => {
    if (character.descriptionType === 'pdf' && character.descriptionAssetName) {
      viewPdf(character.descriptionAssetName);
    } else if (character.descriptionType === 'image' && character.descriptionAssetName) {
      // For images, we could add image viewing logic here
      viewPdf(character.descriptionAssetName);
    } else {
      // Default to markdown
      viewMarkdown(character.description, character.name);
    }
  };

  const handleAddItem = (characterId: string) => {
    setEditingInventoryCharacterId(characterId);
    resetItemForm();
    setIsAddItemDialogOpen(true);
  };

  const handleEditItem = (characterId: string, itemId: string) => {
    setEditingInventoryCharacterId(characterId);
    handleEditItemClick(itemId);
  };

  const handleDeleteItemFromInventory = (characterId: string, itemId: string) => {
    setEditingInventoryCharacterId(characterId);
    handleDeleteItem(itemId);
    showNotification('Item deleted successfully');
  };

  // Toggle character inventory expansion
  const handleToggleInventory = (characterId: string) => {
    setExpandedCharacters(prev => ({
      ...prev,
      [characterId]: !prev[characterId]
    }));
  };

  // Function to handle form field changes
  const handleFormChange = (field: string, value: any) => {
    handleChange(field as keyof CharacterFormData, value);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
          Characters
        </h1>
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button 
            startIcon={<AddIcon />}
            variant="contained" 
            color="primary"
            onPress={() => setIsAddDialogOpen(true)}
            className="btn-glow"
          >
            Add Character
          </Button>
          <Button 
            startIcon={<SaveIcon />}
            variant="outlined"
            onPress={handleSaveData}
          >
            Save Data
          </Button>
        </div>
      </div>

      {/* Floating search and view toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex-grow w-full md:w-auto shadow-md rounded-xl">
          <CharacterSearch
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center">
          <Button 
            startIcon={isGridView ? <ListViewIcon /> : <GridViewIcon />}
            variant="contained" 
            color="secondary"
            onPress={() => setIsGridView(!isGridView)}
            className="shadow-md rounded-xl"
          >
            {isGridView ? "List View" : "Grid View"}
          </Button>
        </div>
      </div>

      {/* Direct content area without nested containers */}
      <div className="mb-6">
        {filteredCharacters.length > 0 ? (
          isGridView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCharacters.map(character => (
                <CharacterItem
                  key={character.id}
                  character={character}
                  locations={locations}
                  onEdit={handleEditCharacter}
                  onDelete={handleDeleteCharacter}
                  onViewAsset={handleViewAsset}
                  onAddItem={handleAddItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItemFromInventory}
                  gridView={true}
                  isExpanded={expandedCharacters[character.id]}
                  onToggleInventory={handleToggleInventory}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 shadow-md rounded-xl bg-background-surface/30 p-4">
              {filteredCharacters.map(character => (
                <CharacterItem
                  key={character.id}
                  character={character}
                  locations={locations}
                  onEdit={handleEditCharacter}
                  onDelete={handleDeleteCharacter}
                  onViewAsset={handleViewAsset}
                  onAddItem={handleAddItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItemFromInventory}
                  gridView={false}
                  isExpanded={expandedCharacters[character.id]}
                  onToggleInventory={handleToggleInventory}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-background-surface flex items-center justify-center">
              <PersonIcon className="text-4xl text-text-secondary" />
            </div>
            <p className="text-text-secondary text-lg mb-6">No characters found. Create your first character to get started.</p>
            <Button
              variant="contained"
              color="primary"
              onPress={() => setIsAddDialogOpen(true)}
              className="btn-glow"
            >
              Create Character
            </Button>
          </div>
        )}
      </div>

      {/* Character Form Dialog */}
      <CharacterFormDialog
        open={isAddDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}
        title={isAddDialogOpen ? "Add New Character" : "Edit Character"}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={isAddDialogOpen ? handleAddCharacter : handleSaveCharacter}
        locations={locations}
        imageAssets={imageAssets}
      />

      {/* Inventory Item Dialog */}
      <ItemFormDialog
        open={isAddItemDialogOpen || isEditItemDialogOpen}
        onClose={() => {
          setIsAddItemDialogOpen(false);
          setIsEditItemDialogOpen(false);
          resetItemForm();
        }}
        title={isAddItemDialogOpen ? "Add New Item" : "Edit Item"}
        item={newItem}
        onChange={handleItemChange}
        onSubmit={isAddItemDialogOpen ? handleAddInventoryItem : handleSaveEditedItem}
      />

      {/* Asset Viewer Dialogs */}
      <AssetViewerDialog
        pdfViewerOpen={pdfViewerOpen}
        markdownDialogOpen={markdownDialogOpen}
        currentPdfAsset={currentPdfAsset}
        currentMarkdownContent={currentMarkdownContent}
        currentMarkdownTitle={currentMarkdownTitle}
        onClose={closeAssetViewer}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={hideNotification}
        message={snackbarMessage}
        action={
          <IconButton 
            size="small" 
            aria-label="close"
            onClick={hideNotification}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </div>
  );
}; 