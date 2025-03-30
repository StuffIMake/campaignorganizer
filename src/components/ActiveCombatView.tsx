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

  return (
    <Box className="h-full w-full flex flex-col overflow-hidden relative bg-gray-900">
      {/* Semi-transparent overlay for background image */}
      <Box className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-0" />
      
      {/* Header with combat info */}
      <Paper className="p-4 mb-2 flex justify-between items-center bg-gray-800 relative z-10">
        <Box className="flex items-center">
          <IconButton onClick={handleEndCombat} className="mr-2">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{combat.name}</Typography>
          <Chip label={`Round: ${round}`} color="primary" className="ml-3" />
        </Box>
        
        <Box className="flex items-center gap-2">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setAddParticipantDialog(true)}
          >
            Add Participant
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleEndCombat}
          >
            End Combat
          </Button>
        </Box>
      </Paper>
      
      {/* Main content area */}
      <Box className="flex flex-1 overflow-hidden gap-2 p-2 relative z-10">
        {/* Initiative order list */}
        <Paper className="w-72 overflow-auto bg-gray-800 p-2">
          <Typography variant="h6" className="mb-2 px-2">Initiative Order</Typography>
          
          <List>
            {participants.map((participant, index) => (
              <ListItem 
                key={participant.id}
                className={`mb-1 rounded cursor-pointer ${
                  index === currentTurnIndex 
                    ? 'bg-amber-800 bg-opacity-40 border-l-4 border-amber-500' 
                    : participant.id === selectedParticipantId 
                      ? 'bg-blue-900 bg-opacity-30 border-l-4 border-blue-500'
                      : 'border-l-4 border-transparent'
                }`}
                onClick={() => handleSelectParticipant(participant.id)}
                secondaryAction={
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveParticipant(participant.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {participant.isPlayerCharacter ? 
                    <PersonIcon color="primary" /> : 
                    <SportsKabaddiIcon color="error" />
                  }
                </ListItemIcon>
                
                <ListItemText 
                  primary={
                    <Box className="flex items-center justify-between">
                      <Typography variant="body1" className={participant.isDefeated ? "line-through text-gray-500" : ""}>
                        {participant.character.name}
                      </Typography>
                      <Box className="flex items-center">
                        <Badge 
                          content={participant.initiative} 
                          color="primary"
                          className="mr-1"
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingParticipantId(participant.id === editingParticipantId ? null : participant.id);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" component="div">
                        HP: {participant.currentHp}/{participant.maxHp}
                      </Typography>
                      
                      {editingParticipantId === participant.id && (
                        <Box className="mt-2 flex flex-col gap-2">
                          <TextField
                            label="Initiative"
                            size="small"
                            type="number"
                            value={participant.initiative}
                            onChange={(e) => handleUpdateInitiative(participant.id, parseInt(e.target.value) || 0)}
                            fullWidth
                          />
                          <TextField
                            label="Current HP"
                            size="small"
                            type="number"
                            value={participant.currentHp}
                            onChange={(e) => handleUpdateHp(participant.id, parseInt(e.target.value) || 0)}
                            fullWidth
                          />
                          <TextField
                            label="Notes"
                            size="small"
                            multiline
                            rows={2}
                            value={participant.notes}
                            onChange={(e) => handleUpdateNotes(participant.id, e.target.value)}
                            fullWidth
                          />
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        
        {/* Active participant details */}
        <Paper className="flex-1 p-4 bg-gray-800 flex flex-col overflow-auto">
          {selectedParticipant ? (
            <>
              <Box className="flex justify-between items-center mb-4">
                <Box>
                  <Typography variant="h5">
                    {selectedParticipant.id === currentParticipant?.id 
                      ? `Current Turn: ${selectedParticipant.character.name}`
                      : selectedParticipant.character.name
                    }
                  </Typography>
                  {selectedParticipant.id !== currentParticipant?.id && (
                    <Typography variant="caption" className="text-gray-400">
                      Viewing details - not the active turn
                    </Typography>
                  )}
                </Box>
                <Button 
                  variant="contained" 
                  color="secondary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={nextTurn}
                >
                  Next Turn
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card className="bg-gray-900 h-full">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Character Details
                      </Typography>
                      <Typography variant="body1">
                        Type: {selectedParticipant.character.type.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" className="mb-2">
                        HP: {selectedParticipant.currentHp}/{selectedParticipant.maxHp}
                      </Typography>
                      
                      <Divider className="my-2" />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Description:
                      </Typography>
                      <Box className="p-2 bg-gray-800 rounded">
                        <MarkdownContent content={selectedParticipant.character.description || "*No description provided*"} />
                      </Box>
                      
                      {/* HP adjustment controls */}
                      <Box className="mt-4">
                        <Typography variant="subtitle2" gutterBottom>Adjust HP</Typography>
                        <Box className="flex gap-1">
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp - 1)}
                          >
                            -1
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp - 5)}
                          >
                            -5
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            size="small"
                            onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp + 1)}
                          >
                            +1
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            size="small"
                            onClick={() => handleUpdateHp(selectedParticipant.id, selectedParticipant.currentHp + 5)}
                          >
                            +5
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card className="bg-gray-900 h-full">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Combat Notes
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={8}
                        value={selectedParticipant.notes}
                        onChange={(e) => handleUpdateNotes(selectedParticipant.id, e.target.value)}
                        placeholder="Add notes for this character..."
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                {selectedParticipant.character.inventory && selectedParticipant.character.inventory.length > 0 && (
                  <Grid item xs={12}>
                    <Card className="bg-gray-900">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Inventory
                        </Typography>
                        <List dense>
                          {selectedParticipant.character.inventory.map(item => (
                            <ListItem key={item.id}>
                              <ListItemText 
                                primary={item.name} 
                                secondary={item.description} 
                              />
                              <Typography variant="body2">
                                Qty: {item.quantity}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <Box className="flex justify-center items-center h-full">
              <Typography variant="h6">No participants in combat</Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Add participant dialog */}
      <Dialog 
        open={addParticipantDialog} 
        onClose={() => setAddParticipantDialog(false)}
      >
        <DialogTitle>Add Combat Participant</DialogTitle>
        <DialogContent>
          <Box className="mt-2 flex flex-col gap-3">
            <Box className="mb-2">
              <Typography variant="subtitle2" gutterBottom>Select Character:</Typography>
              <select 
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                value={newParticipantId}
                onChange={(e) => setNewParticipantId(e.target.value)}
              >
                <option value="">-- Select a character --</option>
                {characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name} ({character.type}) - HP: {character.hp}
                  </option>
                ))}
              </select>
            </Box>
            
            <TextField
              label="Initiative"
              type="number"
              value={newInitiative}
              onChange={(e) => setNewInitiative(parseInt(e.target.value) || 0)}
              fullWidth
              helperText="Higher initiative goes first"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddParticipantDialog(false)}>Cancel</Button>
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