import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box
} from '../../../components/ui';
import { Character } from '../../../store';
import { Combobox } from '@headlessui/react';

interface AddParticipantDialogProps {
  open: boolean;
  onClose: () => void;
  onAddParticipant: (characterId: string, initiative: number, isPlayerCharacter: boolean) => void;
  characters: Character[];
}

/**
 * Dialog component for adding a new participant to combat
 */
export const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  open,
  onClose,
  onAddParticipant,
  characters
}) => {
  // State for form values
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [initiative, setInitiative] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter characters based on search query
  const filteredCharacters = searchQuery
    ? characters.filter(character => 
        character.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : characters;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacterId) return;
    
    const character = characters.find(c => c.id === selectedCharacterId);
    if (!character) return;
    
    const isPlayerCharacter = character.type === 'player';
    
    onAddParticipant(selectedCharacterId, initiative, isPlayerCharacter);
    resetForm();
    onClose();
  };
  
  // Reset form values
  const resetForm = () => {
    setSelectedCharacterId('');
    setInitiative(10);
    setSearchQuery('');
  };
  
  // Handle dialog close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Handle character selection
  const handleCharacterChange = (value: string | null) => {
    setSelectedCharacterId(value || '');
  };
  
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Combat Participant</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="mb-4">
            <Combobox value={selectedCharacterId} onChange={handleCharacterChange}>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md p-2">
                  <Combobox.Input
                    className="w-full bg-transparent border-none focus:outline-none"
                    placeholder="Search for a character..."
                    displayValue={(id: string) => {
                      const character = characters.find(c => c.id === id);
                      return character ? character.name : '';
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
                  {filteredCharacters.map((character) => (
                    <Combobox.Option
                      key={character.id}
                      value={character.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                          active ? 'bg-blue-100 dark:bg-blue-900' : ''
                        }`
                      }
                    >
                      <Box className="flex items-center">
                        <Box 
                          className={`w-3 h-3 rounded-full mr-2 ${
                            character.type === 'player' 
                              ? 'bg-green-500' 
                              : character.type === 'enemy' 
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                          }`} 
                        />
                        <span>{character.name}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({character.type})
                        </span>
                      </Box>
                    </Combobox.Option>
                  ))}
                  {filteredCharacters.length === 0 && searchQuery !== '' && (
                    <div className="p-4 text-center text-gray-500">
                      No characters found
                    </div>
                  )}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
          
          <TextField
            label="Initiative"
            type="number"
            fullWidth
            value={initiative}
            onChange={(e) => setInitiative(Number(e.target.value))}
            className="mb-3"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!selectedCharacterId}
          >
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 