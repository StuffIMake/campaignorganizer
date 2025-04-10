import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box,
  Divider,
  Typography,
  Card
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // Group characters by type for better organization
  const groupedCharacters = React.useMemo(() => {
    const groups: { [key: string]: Character[] } = {
      player: [],
      enemy: [],
      npc: [],
      other: []
    };
    
    characters.forEach(character => {
      const type = character.type || 'other';
      if (groups[type]) {
        groups[type].push(character);
      } else {
        groups.other.push(character);
      }
    });
    
    return groups;
  }, [characters]);
  
  // Filter characters based on search query
  const filteredCharacters = searchQuery
    ? characters.filter(character => 
        character.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : characters;
  
  // Update selected character when ID changes
  useEffect(() => {
    if (selectedCharacterId) {
      const character = characters.find(c => c.id === selectedCharacterId);
      setSelectedCharacter(character || null);
    } else {
      setSelectedCharacter(null);
    }
  }, [selectedCharacterId, characters]);
  
  // Handle form submission - no longer needed as we directly use the Add Character button
  const handleAddCharacter = () => {
    if (!selectedCharacterId || !selectedCharacter) return;
    const isPlayerCharacter = selectedCharacter.type === 'player';
    
    // Initiative will be set in the next dialog
    onAddParticipant(selectedCharacterId, 0, isPlayerCharacter);
    resetForm();
    onClose();
  };
  
  // Reset form values
  const resetForm = () => {
    setSelectedCharacterId('');
    setSearchQuery('');
    setSelectedCharacter(null);
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
  
  // Render character group with heading
  const renderCharacterGroup = (title: string, charactersInGroup: Character[]) => {
    if (!charactersInGroup.length) return null;
    
    return (
      <div className="mb-2">
        <Typography variant="subtitle2" className="text-xs font-semibold uppercase text-text-secondary px-3 py-1">
          {title}
        </Typography>
        {charactersInGroup.map(character => (
          <Combobox.Option
            key={character.id}
            value={character.id}
            className={({ active }) =>
              `cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                active ? 'bg-blue-100 dark:bg-blue-900/40' : ''
              }`
            }
          >
            {({ selected, active }) => (
              <Box className={`flex items-center ${selected ? 'font-semibold' : ''}`}>
                <Box 
                  className={`w-3 h-3 rounded-full mr-2 ${
                    character.type === 'player' 
                      ? 'bg-green-500' 
                      : character.type === 'enemy' 
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`} 
                />
                <span className={active ? 'text-blue-700 dark:text-blue-300' : ''}>{character.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {character.type}
                </span>
                {selected && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </span>
                )}
              </Box>
            )}
          </Combobox.Option>
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" className="font-display">
          Add Combat Participant
        </Typography>
      </DialogTitle>
      <DialogContent>
        <div className="mb-4">
          <Typography variant="body2" className="mb-2">
            Select a character to add to the combat:
          </Typography>
          
          <Combobox value={selectedCharacterId} onChange={handleCharacterChange}>
            <div className="relative">
              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md p-2">
                <Combobox.Input
                  className="w-full bg-transparent border-none focus:outline-none dark:text-white"
                  placeholder="Search for a character..."
                  displayValue={(id: string) => {
                    const character = characters.find(c => c.id === id);
                    return character ? character.name : '';
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <Combobox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
                {searchQuery ? (
                  // Show flat list when searching
                  filteredCharacters.length > 0 ? (
                    filteredCharacters.map((character) => (
                      <Combobox.Option
                        key={character.id}
                        value={character.id}
                        className={({ active }) =>
                          `cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                            active ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                          }`
                        }
                      >
                        {({ selected, active }) => (
                          <Box className={`flex items-center ${selected ? 'font-semibold' : ''}`}>
                            <Box 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                character.type === 'player' 
                                  ? 'bg-green-500' 
                                  : character.type === 'enemy' 
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                              }`} 
                            />
                            <span className={active ? 'text-blue-700 dark:text-blue-300' : ''}>{character.name}</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({character.type})
                            </span>
                          </Box>
                        )}
                      </Combobox.Option>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No characters found
                    </div>
                  )
                ) : (
                  // Show grouped list when not searching
                  <>
                    {renderCharacterGroup('Player Characters', groupedCharacters.player)}
                    {renderCharacterGroup('Enemies', groupedCharacters.enemy)}
                    {renderCharacterGroup('NPCs', groupedCharacters.npc)}
                    {renderCharacterGroup('Other', groupedCharacters.other)}
                  </>
                )}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
        
        {selectedCharacter && (
          <Card className="p-3 mt-4 bg-background-surface/30">
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Selected Character:
            </Typography>
            <div className="flex items-center mb-2">
              <Box 
                className={`w-3 h-3 rounded-full mr-2 ${
                  selectedCharacter.type === 'player' 
                    ? 'bg-green-500' 
                    : selectedCharacter.type === 'enemy' 
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`} 
              />
              <Typography variant="body1" className="font-medium">
                {selectedCharacter.name}
              </Typography>
              <Typography variant="caption" className="ml-2 text-text-secondary">
                ({selectedCharacter.type || 'Character'})
              </Typography>
            </div>
            <Typography variant="body2" className="text-text-secondary">
              HP: {selectedCharacter.hp || 10}
            </Typography>
          </Card>
        )}
        
        <Typography variant="body2" className="text-text-secondary mt-4">
          Note: After adding, you'll be prompted to set the participant's initiative.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onPress={handleClose} variant="outlined">Cancel</Button>
        <Button 
          onPress={handleAddCharacter}
          variant="contained" 
          color="primary"
          isDisabled={!selectedCharacterId}
        >
          Add to Combat
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 