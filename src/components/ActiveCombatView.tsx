import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar
} from './ui';
import { Combobox } from '@headlessui/react';
import { Combat, Character, Item } from '../store';
import { useStore } from '../store';
import MarkdownContent from './MarkdownContent';
import { ArrowBackIcon, DeleteIcon, EditIcon } from '../assets/icons';
import {
  PersonIcon,
  SportsKabaddiIcon
} from './ui';

// Custom Badge component for initiative display
interface BadgeProps {
  content: React.ReactNode;
  color?: 'primary' | 'error' | string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ content, color = "primary", className = "" }) => (
  <div className={`relative inline-flex items-center ${className}`}>
    <span className={`absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs text-white rounded-full ${color === 'primary' ? 'bg-blue-500' : 'bg-red-500'}`}>
      {content}
    </span>
  </div>
);

// Custom arrow forward icon for next turn button
const ArrowForwardIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="inline-block"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// Interface for combat participants with initiative
interface CombatParticipant {
  id: string;
  character: Character;
  initiative: number;
  currentHp: number;
  maxHp: number;
  notes: string;
  isPlayerCharacter: boolean;
  isDefeated?: boolean;
}

interface ActiveCombatViewProps {
  combat: Combat;
  onClose: () => void;
}

export const ActiveCombatView: React.FC<ActiveCombatViewProps> = ({ combat, onClose }) => {
  const characters = useStore(state => state.characters);
  const playTrack = useStore(state => state.playTrack);
  const stopIndividualTrack = useStore(state => state.stopIndividualTrack);
  
  // Combat state
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  
  // Dialog and UI state
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newInitiative, setNewInitiative] = useState(10);
  
  // Add a search state for the character dropdown
  const [characterSearchQuery, setCharacterSearchQuery] = useState('');

  // Audio tracking
  const entrySoundRef = useRef<string | null>(null);
  const bgmTrackRef = useRef<string | null>(null);
  const audioInitialized = useRef(false);

  // Initialize audio when component mounts
  useEffect(() => {
    if (!audioInitialized.current) {
      if (combat.entrySound) {
        const entryTrackId = `/audio/${combat.entrySound}`;
        entrySoundRef.current = entryTrackId;
        playTrack(entryTrackId, { 
          replace: false, 
          locationId: `combat-entrysound-${combat.id}`, 
          loop: false 
        });
      }
      
      if (combat.backgroundMusic) {
        const bgmTrackId = `/audio/${combat.backgroundMusic}`;
        bgmTrackRef.current = bgmTrackId;
        playTrack(bgmTrackId, { 
          replace: false, 
          locationId: `combat-bgm-${combat.id}`, 
          loop: true 
        });
      }
      
      audioInitialized.current = true;
    }
    
    // Cleanup function to stop tracks when component unmounts
    return () => {
      if (entrySoundRef.current) {
        stopIndividualTrack(entrySoundRef.current);
        entrySoundRef.current = null;
      }
      
      if (bgmTrackRef.current) {
        stopIndividualTrack(bgmTrackRef.current);
        bgmTrackRef.current = null;
      }
    };
  }, [combat.id, combat.entrySound, combat.backgroundMusic, playTrack, stopIndividualTrack]);
  
  // Initialize combat participants
  useEffect(() => {
    initializeCombat();
  }, []);

  // Current participant (whose turn it is)
  const currentParticipant = participants[currentTurnIndex];
  
  // Selected participant (for details panel)
  const selectedParticipant = participants.find(p => p.id === (selectedParticipantId || currentParticipant?.id));
  
  // Update selectedParticipantId when current turn changes
  useEffect(() => {
    if (currentParticipant && !selectedParticipantId) {
      setSelectedParticipantId(currentParticipant.id);
    }
  }, [currentParticipant, selectedParticipantId]);

  // Initialize combat participants from combat data
  const initializeCombat = () => {
    // Create participants from player characters
    const playerParticipants = combat.playerCharacters.map(pc => {
      const character = characters.find(c => c.id === pc.id);
      if (!character) return null;
      
      return {
        id: `pc-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
        character,
        initiative: 0,
        currentHp: character.hp || 10,
        maxHp: character.hp || 10,
        notes: '',
        isPlayerCharacter: true
      };
    }).filter(Boolean) as CombatParticipant[];
    
    // Create participants from enemies
    const enemyParticipants = combat.enemies.map(enemy => {
      const character = characters.find(c => c.id === enemy.id);
      if (!character) return null;
      
      return {
        id: `enemy-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
        character,
        initiative: Math.floor(Math.random() * 20) + 1, // Random initiative for initial setup
        currentHp: character.hp || 10,
        maxHp: character.hp || 10,
        notes: '',
        isPlayerCharacter: false
      };
    }).filter(Boolean) as CombatParticipant[];
    
    // Combine and sort by initiative
    const allParticipants = [...playerParticipants, ...enemyParticipants]
      .sort((a, b) => b.initiative - a.initiative);
    
    setParticipants(allParticipants);
    setCurrentTurnIndex(0); // Start with the highest initiative
    setRound(1);
  };

  // Move to the next turn
  const nextTurn = () => {
    if (participants.length === 0) return;
    
    const nextIndex = (currentTurnIndex + 1) % participants.length;
    setCurrentTurnIndex(nextIndex);
    
    // When turn changes, update selected participant
    setSelectedParticipantId(participants[nextIndex].id);
    
    // If we've looped back to the first participant, increment the round
    if (nextIndex === 0) {
      setRound(prevRound => prevRound + 1);
    }
  };

  // Filter available characters for the dropdown
  const filteredCharacters = React.useMemo(() => {
    if (!characterSearchQuery) return characters;
    const query = characterSearchQuery.toLowerCase();
    return characters.filter(character => 
      character.name.toLowerCase().includes(query)
    );
  }, [characters, characterSearchQuery]);

  // Add a new participant to combat
  const handleAddParticipant = () => {
    if (!newParticipantId) return;
    
    const character = characters.find(c => c.id === newParticipantId);
    if (!character) return;
    
    const isPlayerCharacter = character.type === 'player';
    
    const newParticipant: CombatParticipant = {
      id: `${isPlayerCharacter ? 'pc' : 'enemy'}-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
      character,
      initiative: newInitiative,
      currentHp: character.hp || 10,
      maxHp: character.hp || 10,
      notes: '',
      isPlayerCharacter
    };
    
    // Add to participants and resort by initiative
    const updatedParticipants = [...participants, newParticipant]
      .sort((a, b) => b.initiative - a.initiative);
    
    // Find the new index of the current participant to maintain turn
    const currentId = participants[currentTurnIndex]?.id;
    const newCurrentIndex = currentId 
      ? updatedParticipants.findIndex(p => p.id === currentId)
      : 0;
    
    setParticipants(updatedParticipants);
    setCurrentTurnIndex(newCurrentIndex >= 0 ? newCurrentIndex : 0);
    setAddParticipantDialog(false);
    setNewParticipantId('');
    setNewInitiative(10);
  };

  // Update a participant's initiative
  const handleUpdateInitiative = (participantId: string, initiative: number) => {
    const updatedParticipants = participants.map(p => 
      p.id === participantId ? { ...p, initiative } : p
    ).sort((a, b) => b.initiative - a.initiative);
    
    // Find the new index of the current participant to maintain turn
    const currentId = participants[currentTurnIndex]?.id;
    const newCurrentIndex = currentId 
      ? updatedParticipants.findIndex(p => p.id === currentId)
      : 0;
    
    setParticipants(updatedParticipants);
    setCurrentTurnIndex(newCurrentIndex >= 0 ? newCurrentIndex : 0);
  };

  // Update a participant's HP
  const handleUpdateHp = (participantId: string, hp: number) => {
    // Ensure HP is between 0 and max
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;
    
    const clampedHp = Math.max(0, Math.min(participant.maxHp, hp));
    
    // If HP reaches 0 for enemy, mark as defeated
    const isDefeated = !participant.isPlayerCharacter && clampedHp <= 0;
    
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, currentHp: clampedHp, isDefeated: isDefeated || p.isDefeated } : p
    ));
  };

  // Update a participant's notes
  const handleUpdateNotes = (participantId: string, notes: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, notes } : p
    ));
  };

  // Remove a participant from combat
  const handleRemoveParticipant = (participantId: string) => {
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) return;
    
    const updatedParticipants = participants.filter(p => p.id !== participantId);
    
    // If no participants left, close combat
    if (updatedParticipants.length === 0) {
      onClose();
      return;
    }
    
    // Adjust current turn index if necessary
    let newIndex = currentTurnIndex;
    if (index === currentTurnIndex) {
      // If removing current participant, go to next
      newIndex = currentTurnIndex % updatedParticipants.length;
    } else if (index < currentTurnIndex) {
      // If removing participant before current, adjust index
      newIndex = currentTurnIndex - 1;
    }
    
    setParticipants(updatedParticipants);
    setCurrentTurnIndex(newIndex);
  };

  // Handle selecting a participant for viewing/editing
  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
  };

  // Handle ending combat and cleanup
  const handleEndCombat = () => {
    // Stop audio tracks
    if (entrySoundRef.current) {
      stopIndividualTrack(entrySoundRef.current);
      entrySoundRef.current = null;
    }
    
    if (bgmTrackRef.current) {
      stopIndividualTrack(bgmTrackRef.current);
      bgmTrackRef.current = null;
    }
    
    onClose();
  };

  // Replace the character selection dropdown in the Add Participant Dialog with Combobox
  const renderCharacterDropdown = () => (
    <div className="w-full mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Character
      </label>
      <Combobox 
        value={newParticipantId}
        onChange={(characterId: string) => {
          setNewParticipantId(characterId);
        }}
      >
        <div className="relative w-full">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setCharacterSearchQuery(e.target.value)}
            displayValue={(characterId: string) => {
              if (!characterId) return 'Select a character';
              const character = characters.find(c => c.id === characterId);
              return character ? character.name : 'Select a character';
            }}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          {filteredCharacters.map((character) => (
            <Combobox.Option
              key={character.id}
              value={character.id}
              className={({ active }) =>
                `cursor-default select-none relative py-2 px-4 ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                }`
              }
            >
              <div className="flex justify-between items-center">
                <span>{character.name}</span>
                <span className={`text-sm ${character.type === 'player' ? 'text-green-500' : 'text-red-500'}`}>
                  {character.type === 'player' ? 'Player' : 'Enemy'}
                </span>
              </div>
            </Combobox.Option>
          ))}
          {filteredCharacters.length === 0 && (
            <div className="py-2 px-4 text-gray-500">No characters found</div>
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );

  return (
    <Box className="h-full flex flex-col">
      {/* Header with combat name and back button */}
      <Box className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <Box className="flex items-center">
          <IconButton onClick={onClose} size="small" className="mr-2 text-white">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{combat.name}</Typography>
        </Box>
        <Box>
          <Typography variant="body2">Round: {round}</Typography>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Box className="flex flex-grow overflow-hidden">
        {/* Left sidebar with initiative order */}
        <Box className="w-1/4 bg-gray-100 dark:bg-gray-700 overflow-y-auto">
          <Box className="p-3 bg-gray-200 dark:bg-gray-600 flex justify-between items-center">
            <Typography variant="subtitle1" className="font-bold">
              Initiative Order
            </Typography>
            <Button
              variant="contained" 
              color="primary"
              size="small"
              onClick={() => setAddParticipantDialog(true)}
            >
              Add
            </Button>
          </Box>
          
          <List>
            {participants.map((participant, index) => (
              <div 
                key={participant.id}
                onClick={() => handleSelectParticipant(participant.id)}
                className={`
                  py-2 px-3 cursor-pointer
                  ${index === currentTurnIndex ? 'bg-blue-100 dark:bg-blue-800' : ''}
                  ${participant.isDefeated ? 'opacity-50 line-through' : ''}
                `}
              >
                <Box className="flex items-center w-full">
                  <Avatar className={`
                    ${participant.isPlayerCharacter ? 'bg-green-500' : 'bg-red-500'}
                    ${participant.isDefeated ? 'opacity-50' : ''}
                  `}>
                    {participant.isPlayerCharacter ? <PersonIcon /> : <SportsKabaddiIcon />}
                  </Avatar>
                  <Box className="ml-3 flex-grow">
                    <Typography variant="body1" className="font-semibold">
                      {participant.character.name}
                    </Typography>
                    <Box className="flex justify-between items-center">
                      <Typography variant="body2">
                        HP: {participant.currentHp}/{participant.maxHp}
                      </Typography>
                      <Chip label={`Init: ${participant.initiative}`} size="small" />
                    </Box>
                  </Box>
                </Box>
              </div>
            ))}
            {participants.length === 0 && (
              <Box className="p-4 text-center text-gray-500">
                <Typography>No participants yet. Add some to start combat.</Typography>
              </Box>
            )}
          </List>
        </Box>
        
        {/* Right content area */}
        <Box className="flex-grow p-4 overflow-y-auto">
          {selectedParticipant ? (
            <Card>
              <CardContent>
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="h5" className="font-bold">
                      {selectedParticipant.character.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedParticipant.isPlayerCharacter ? 'Player Character' : 'Enemy'}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton 
                      onClick={() => setEditingParticipantId(selectedParticipant.id)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider className="my-3" />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Hit Points</Typography>
                    <Typography variant="h6">
                      {selectedParticipant.currentHp} / {selectedParticipant.maxHp}
                    </Typography>
                    {/* HP adjustment buttons */}
                    <Box className="flex gap-1 mt-2">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp - 1)}
                      >
                        -1
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp - 5)}
                      >
                        -5
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="success"
                        onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp + 1)}
                      >
                        +1
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="success"
                        onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp + 5)}
                      >
                        +5
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Initiative</Typography>
                    <Typography variant="h6">{selectedParticipant.initiative}</Typography>
                    {/* Initiative adjustment buttons */}
                    <Box className="flex gap-1 mt-2">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleUpdateInitiative(selectedParticipant.id, selectedParticipant.initiative - 1)}
                      >
                        -1
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleUpdateInitiative(selectedParticipant.id, selectedParticipant.initiative + 1)}
                      >
                        +1
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box className="mt-4">
                  <Typography variant="subtitle2">Notes</Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    value={selectedParticipant.notes}
                    onChange={(e) => handleUpdateNotes(selectedParticipant.id, e.target.value)}
                    placeholder="Add combat notes here..."
                    variant="outlined"
                    size="small"
                    className="mt-1"
                  />
                </Box>
                
                <Box className="mt-4 flex justify-between">
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleRemoveParticipant(selectedParticipant.id)}
                  >
                    Remove from Combat
                  </Button>
                  <Button 
                    variant="outlined" 
                    color={selectedParticipant.isDefeated ? "success" : "error"}
                    onClick={() => {
                      setParticipants(participants.map(p => 
                        p.id === selectedParticipant.id 
                          ? { ...p, isDefeated: !p.isDefeated }
                          : p
                      ));
                    }}
                  >
                    {selectedParticipant.isDefeated ? "Revive" : "Defeat"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper className="p-4 text-center">
              <Typography variant="body1">
                Select a participant from the initiative order to view details.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
      
      {/* Footer with controls */}
      <Box className="bg-gray-200 dark:bg-gray-700 p-3 flex justify-between items-center">
        <Button
          variant="contained"
          color="error"
          onClick={handleEndCombat}
        >
          End Combat
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={nextTurn}
          disabled={participants.length === 0}
          endIcon={<ArrowForwardIcon />}
        >
          Next Turn
        </Button>
      </Box>
      
      {/* Add Participant Dialog */}
      <Dialog
        open={addParticipantDialog}
        onClose={() => setAddParticipantDialog(false)}
      >
        <DialogTitle>Add Participant to Combat</DialogTitle>
        <DialogContent>
          <Box className="pt-2 space-y-4">
            {renderCharacterDropdown()}
            
            <TextField
              label="Initiative"
              type="number"
              fullWidth
              value={newInitiative}
              onChange={(e) => setNewInitiative(parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddParticipantDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddParticipant} 
            color="primary"
            variant="contained"
            disabled={!newParticipantId}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveCombatView; 