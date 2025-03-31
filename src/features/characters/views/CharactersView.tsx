import React, { useEffect } from 'react';
import { 
  Button, 
  Paper, 
  Grid,
  Snackbar, 
  IconButton 
} from '../../../components/ui';
import { 
  AddIcon, 
  SaveIcon, 
  CloseIcon 
} from '../../../assets/icons';
import { 
  CharacterCard, 
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
  const [editingInventoryCharacterId, setEditingInventoryCharacterId] = React.useState<string | null>(null);
  
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

  const handleDeleteCharacter = (characterId: string) => {
    if (window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      deleteCharacter(characterId);
      showNotification('Character deleted successfully');
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

  // Function to handle form field changes
  const handleFormChange = (field: string, value: any) => {
    handleChange(field as keyof CharacterFormData, value);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Characters</h1>
        <div>
          <Button 
            startIcon={<AddIcon />}
            variant="contained" 
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
            className="mr-2"
          >
            Add Character
          </Button>
          <Button 
            startIcon={<SaveIcon />}
            variant="outlined"
            onClick={handleSaveData}
          >
            Save Data
          </Button>
        </div>
      </div>

      <CharacterSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Paper className="p-4">
        {filteredCharacters.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-500">No characters found. Create a new character to get started.</p>
          </div>
        ) : (
          <Grid container spacing={3}>
            {filteredCharacters.map(character => (
              <Grid item xs={12} md={6} lg={4} key={character.id}>
                <CharacterCard
                  character={character}
                  locations={locations}
                  onEdit={handleEditCharacter}
                  onDelete={handleDeleteCharacter}
                  onViewAsset={() => handleViewAsset(character)}
                  onAddItem={handleAddItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItemFromInventory}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

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

      {/* Item Form Dialog */}
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

      {/* Asset Viewer Dialog */}
      <AssetViewerDialog
        pdfViewerOpen={pdfViewerOpen}
        markdownDialogOpen={markdownDialogOpen}
        currentPdfAsset={currentPdfAsset}
        currentMarkdownContent={currentMarkdownContent}
        currentMarkdownTitle={currentMarkdownTitle}
        onClose={closeAssetViewer}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={hideNotification}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="default"
            onClick={hideNotification}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </div>
  );
}; 