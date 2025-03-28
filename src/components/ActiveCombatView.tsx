import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Autocomplete
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  SportsKabaddi as SportsKabaddiIcon,
  Person as PersonIcon,
  AddCircle as AddCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Store as StoreIcon,
  Star
} from '@mui/icons-material';
import { useStore } from '../store';
import { Combat, Character, Item } from '../store';
import MarkdownContent from './MarkdownContent';
import AssetViewer from './AssetViewer';
import PDFViewer from './PDFViewer';

// Interface for combat participants with initiative
interface CombatParticipant {
  id: string; // Unique ID for this participant instance
  character: Character;
  initiative: number | string;
  currentHp: number | string;
  maxHp: number;
  notes: string;
  isPlayerCharacter: boolean;
  isDefeated?: boolean; // Add this new property
}

interface ActiveCombatViewProps {
  combat: Combat;
  onClose: () => void;
}

export const ActiveCombatView: React.FC<ActiveCombatViewProps> = ({ combat, onClose }) => {
  const playTrack = useStore(state => state.playTrack);
  const stopIndividualTrack = useStore(state => state.stopIndividualTrack);
  const characters = useStore(state => state.characters);
  
  // Refs to track audio IDs
  const entrySoundTrackIdRef = useRef<string | null>(null);
  const bgmTrackIdRef = useRef<string | null>(null);
  const audioInitializedRef = useRef(false);
  
  // Combat state
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newParticipantInitiative, setNewParticipantInitiative] = useState<number | string>(10);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  
  // PDF viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfAsset, setCurrentPdfAsset] = useState('');
  
  // Markdown dialog state
  const [markdownDialogOpen, setMarkdownDialogOpen] = useState(false);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');
  const [currentMarkdownTitle, setCurrentMarkdownTitle] = useState('');
  
  // Add new state for loot dialog
  const [lootDialogOpen, setLootDialogOpen] = useState(false);
  const [currentLoot, setCurrentLoot] = useState<Item[]>([]);
  const [defeatedEnemy, setDefeatedEnemy] = useState<Character | null>(null);
  
  // Add new state for combat rewards
  const [combatCompleted, setCombatCompleted] = useState(false);
  const [showCombatRewards, setShowCombatRewards] = useState(false);
  
  // Initialize audio only once when the component mounts
  useEffect(() => {
    if (!audioInitializedRef.current) {
      // Initialize audio
      if (combat.entrySound) {
        const entryTrackId = `/audio/${combat.entrySound}`;
        entrySoundTrackIdRef.current = entryTrackId;
        playTrack(entryTrackId, { 
          replace: false, 
          locationId: `combat-entrysound-${combat.id}`, 
          loop: false 
        });
      }
      
      if (combat.backgroundMusic) {
        const bgmTrackId = `/audio/${combat.backgroundMusic}`;
        bgmTrackIdRef.current = bgmTrackId;
        playTrack(bgmTrackId, { 
          replace: false, 
          locationId: `combat-bgm-${combat.id}`, 
          loop: true 
        });
      }
      
      audioInitializedRef.current = true;
    }
    
    // Cleanup function to stop tracks when component unmounts
    return () => {
      if (entrySoundTrackIdRef.current) {
        stopIndividualTrack(entrySoundTrackIdRef.current);
        entrySoundTrackIdRef.current = null;
      }
      
      if (bgmTrackIdRef.current) {
        stopIndividualTrack(bgmTrackIdRef.current);
        bgmTrackIdRef.current = null;
      }
    };
  }, [combat.id, combat.entrySound, combat.backgroundMusic]);
  
  // Initialize combat participants only once
  useEffect(() => {
    initializeCombat();
  }, []);
  
  // Initialize combat participants from the combat data
  const initializeCombat = () => {
    // Create participants from player characters
    const playerParticipants = combat.playerCharacters.map(character => ({
      id: `pc-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
      character,
      initiative: 0,
      currentHp: character.hp,
      maxHp: character.hp,
      notes: '',
      isPlayerCharacter: true
    }));
    
    // Create participants from enemies
    const enemyParticipants = combat.enemies.map(character => ({
      id: `enemy-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
      character,
      initiative: Math.floor(Math.random() * 20) + 1, // Random initiative for initial setup
      currentHp: character.hp,
      maxHp: character.hp,
      notes: '',
      isPlayerCharacter: false
    }));
    
    // Combine and sort by initiative
    const allParticipants = [...playerParticipants, ...enemyParticipants]
      .sort((a, b) => b.initiative - a.initiative);
    
    setParticipants(allParticipants);
    setCurrentTurnIndex(0); // Start with the highest initiative
    setRound(1);
  };
  
  // Advance to the next turn in initiative order
  const nextTurn = () => {
    if (participants.length === 0) return;
    
    const nextIndex = (currentTurnIndex + 1) % participants.length;
    setCurrentTurnIndex(nextIndex);
    
    // When turn changes, update selected participant to match the current turn
    setSelectedParticipantId(participants[nextIndex].id);
    
    // If we've looped back to the first participant, increment the round
    if (nextIndex === 0) {
      setRound(prevRound => prevRound + 1);
    }
  };
  
  // Get the current participant (whose turn it is)
  const currentParticipant = participants[currentTurnIndex];
  
  // Get the selected participant (for details panel)
  const selectedParticipant = participants.find(p => p.id === (selectedParticipantId || currentParticipant?.id));
  
  // Update selectedParticipantId on initial load
  useEffect(() => {
    if (currentParticipant && !selectedParticipantId) {
      setSelectedParticipantId(currentParticipant.id);
    }
  }, [currentParticipant]);
  
  // Handle adding a new participant to the combat
  const handleAddParticipant = () => {
    if (!newParticipantId) return;
    
    const character = characters.find(c => c.id === newParticipantId);
    if (!character) return;
    
    const isPlayerCharacter = character.type === 'player';
    
    const initiative = typeof newParticipantInitiative === 'string' ? 
      (parseInt(newParticipantInitiative) || 0) : 
      newParticipantInitiative;
    
    const newParticipant: CombatParticipant = {
      id: `${isPlayerCharacter ? 'pc' : 'enemy'}-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
      character,
      initiative: initiative,
      currentHp: character.hp,
      maxHp: character.hp,
      notes: '',
      isPlayerCharacter
    };
    
    // Add to participants and resort by initiative
    const updatedParticipants = [...participants, newParticipant];
    
    // Sort participants by initiative
    const sortedParticipants = sortParticipantsByInitiative(updatedParticipants);
    
    // Find the new index of the current participant to maintain turn
    const currentId = participants[currentTurnIndex]?.id;
    const newCurrentIndex = currentId 
      ? sortedParticipants.findIndex(p => p.id === currentId)
      : 0;
    
    setParticipants(sortedParticipants);
    setCurrentTurnIndex(newCurrentIndex >= 0 ? newCurrentIndex : 0);
    setIsAddParticipantDialogOpen(false);
    setNewParticipantId('');
    setNewParticipantInitiative(10);
  };
  
  // Sort participants by initiative (ensuring numeric comparison)
  const sortParticipantsByInitiative = (participants: CombatParticipant[]) => {
    return [...participants].sort((a, b) => {
      const initA = typeof a.initiative === 'string' ? 
        (parseInt(a.initiative) || 0) : a.initiative;
      const initB = typeof b.initiative === 'string' ? 
        (parseInt(b.initiative) || 0) : b.initiative;
      return initB - initA;
    });
  };
  
  // Handle updating a participant's initiative
  const handleUpdateInitiative = (participantId: string, initiative: number | string) => {
    // Convert string to number and ensure it's a valid number
    const numInitiative = typeof initiative === 'string' ? 
      (parseInt(initiative) || 0) : 
      initiative;
    
    const updatedParticipants = participants.map(p => 
      p.id === participantId ? { ...p, initiative: numInitiative } : p
    );
    
    // Sort participants by initiative
    const sortedParticipants = sortParticipantsByInitiative(updatedParticipants);
    
    // Find the new index of the current participant to maintain turn
    const currentId = participants[currentTurnIndex]?.id;
    const newCurrentIndex = currentId 
      ? sortedParticipants.findIndex(p => p.id === currentId)
      : 0;
    
    setParticipants(sortedParticipants);
    setCurrentTurnIndex(newCurrentIndex >= 0 ? newCurrentIndex : 0);
  };
  
  // Handle updating a participant's HP
  const handleUpdateHp = (participantId: string, hp: number | string) => {
    const numHp = typeof hp === 'string' ? parseInt(hp) || 0 : hp;
    
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;
    
    // Check if this is an enemy being reduced to 0 or less HP and not already defeated
    if (!participant.isPlayerCharacter && 
        numHp <= 0 && 
        displayHp(participant.currentHp) > 0 && 
        !participant.isDefeated) {
      
      // Mark the participant as defeated
      const updatedParticipants = participants.map(p => 
        p.id === participantId ? { ...p, currentHp: 0, isDefeated: true } : p
      );
      setParticipants(updatedParticipants);
      
      // If the enemy has an inventory (loot), show the loot dialog
      if (participant.character.inventory && participant.character.inventory.length > 0) {
        setDefeatedEnemy(participant.character);
        setCurrentLoot(participant.character.inventory);
        setLootDialogOpen(true);
      }
      
      return;
    }
    
    // Regular HP update
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, currentHp: hp } : p
    ));
  };
  
  // Handle updating a participant's notes
  const handleUpdateNotes = (participantId: string, notes: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, notes } : p
    ));
  };
  
  // Handle removing a participant from combat
  const handleRemoveParticipant = (participantId: string) => {
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) return;
    
    const updatedParticipants = participants.filter(p => p.id !== participantId);
    
    // If no participants left, close combat
    if (updatedParticipants.length === 0) {
      handleClose();
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
  
  // Handle closing the combat view
  const handleClose = () => {
    // Stop audio tracks
    if (entrySoundTrackIdRef.current) {
      stopIndividualTrack(entrySoundTrackIdRef.current);
      entrySoundTrackIdRef.current = null;
    }
    
    if (bgmTrackIdRef.current) {
      stopIndividualTrack(bgmTrackIdRef.current);
      bgmTrackIdRef.current = null;
    }
    
    // Call parent's onClose
    onClose();
  };
  
  // Convert currentHp and initiative to numbers for display or calculations when needed
  const displayHp = (hp: number | string): number => {
    return typeof hp === 'string' ? (parseInt(hp) || 0) : hp;
  };
  
  // Handle viewing a PDF
  const handleViewPdf = (assetName: string) => {
    setCurrentPdfAsset(assetName);
    setPdfViewerOpen(true);
  };
  
  // Add function to handle collecting loot
  const handleCollectLoot = () => {
    // Here you would implement logic to distribute the loot to players
    // For now, we just close the dialog
    setLootDialogOpen(false);
    setCurrentLoot([]);
    setDefeatedEnemy(null);
  };
  
  // Add useEffect to check if all enemies are defeated
  useEffect(() => {
    // Check if all enemies are defeated
    const allEnemiesDefeated = participants.every(p => 
      p.isPlayerCharacter || (displayHp(p.currentHp) <= 0 || p.isDefeated)
    );
    
    // Only update if combat wasn't already completed
    if (allEnemiesDefeated && !combatCompleted && participants.some(p => !p.isPlayerCharacter)) {
      setCombatCompleted(true);
    }
  }, [participants, combatCompleted]);
  
  // Function to handle viewing combat rewards
  const handleViewCombatRewards = () => {
    setShowCombatRewards(true);
  };
  
  // Function to handle collecting all rewards
  const handleCollectAllRewards = () => {
    // Here you would implement the logic to distribute rewards to players
    // For now, we just close the dialog
    setShowCombatRewards(false);
    setCombatCompleted(false);
  };
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden', 
      position: 'relative',
      backgroundColor: '#222',
      backgroundImage: combat.backgroundImage ? `url(/images/${combat.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Semi-transparent overlay for readability over background image */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 0 
      }} />
      
      {/* Header with combat info */}
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleClose} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{combat.name}</Typography>
          
          {/* Add Combat completed indicator */}
          {combatCompleted && (
            <Chip 
              label="Combat Completed" 
              color="success" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`Round: ${round}`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`Difficulty: ${combat.difficulty || 'Medium'}`}
            color="secondary"
            variant="outlined"
          />
          
          {/* Show rewards button when combat is completed */}
          {combatCompleted && combat.rewards && combat.rewards.length > 0 && (
            <Button 
              variant="contained" 
              color="success"
              onClick={handleViewCombatRewards}
              startIcon={<Star />}
            >
              View Rewards
            </Button>
          )}
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddCircleIcon />}
            onClick={() => setIsAddParticipantDialogOpen(true)}
          >
            Add Participant
          </Button>
        </Box>
      </Paper>
      
      {/* Main content area */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        gap: 2,
        p: 2
      }}>
        {/* Initiative order list */}
        <Paper sx={{ 
          width: 300, 
          overflow: 'auto',
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          p: 1
        }}>
          <Typography variant="h6" sx={{ mb: 2, p: 1 }}>Initiative Order</Typography>
          
          <List>
            {participants.map((participant, index) => (
              <ListItem 
                key={participant.id}
                sx={{ 
                  mb: 1,
                  backgroundColor: index === currentTurnIndex 
                    ? 'rgba(255, 165, 0, 0.3)' 
                    : participant.id === selectedParticipantId && index !== currentTurnIndex
                      ? 'rgba(25, 118, 210, 0.2)'
                      : 'transparent',
                  borderLeft: index === currentTurnIndex 
                    ? '4px solid orange' 
                    : participant.id === selectedParticipantId
                      ? '4px solid #1976d2'
                      : '4px solid transparent',
                  transition: 'all 0.3s ease',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectParticipant(participant.id)}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the ListItem click
                      handleRemoveParticipant(participant.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1">{participant.character.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge 
                          badgeContent={participant.initiative} 
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the ListItem click
                            setEditingParticipantId(participant.id === editingParticipantId ? null : participant.id);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" component="div">
                        HP: {displayHp(participant.currentHp)}/{participant.maxHp}
                      </Typography>
                      {editingParticipantId === participant.id && (
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField
                            label="Initiative"
                            size="small"
                            value={participant.initiative}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string for easier editing
                              if (value === '') {
                                handleUpdateInitiative(participant.id, '');
                              } else {
                                const parsed = parseInt(value);
                                if (!isNaN(parsed)) {
                                  handleUpdateInitiative(participant.id, parsed);
                                }
                              }
                            }}
                            onBlur={() => {
                              // When field loses focus, ensure we have a valid number
                              if (typeof participant.initiative === 'string' || isNaN(participant.initiative)) {
                                handleUpdateInitiative(participant.id, 0);
                              }
                            }}
                            inputProps={{
                              min: 0,
                              step: 1
                            }}
                            helperText="Higher initiative goes first"
                          />
                          <TextField
                            label="Current HP"
                            size="small"
                            value={participant.currentHp}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string for easier editing
                              if (value === '') {
                                handleUpdateHp(participant.id, '');
                              } else {
                                const parsed = parseInt(value);
                                if (!isNaN(parsed)) {
                                  handleUpdateHp(participant.id, parsed);
                                }
                              }
                            }}
                            onBlur={() => {
                              // When field loses focus, ensure we have a valid number
                              if (typeof participant.currentHp === 'string' || isNaN(participant.currentHp)) {
                                handleUpdateHp(participant.id, 0);
                              }
                            }}
                            inputProps={{
                              min: 0,
                              max: participant.maxHp,
                              step: 1
                            }}
                            helperText={`Max: ${participant.maxHp}`}
                          />
                          <TextField
                            label="Notes"
                            size="small"
                            multiline
                            rows={2}
                            value={participant.notes}
                            onChange={(e) => handleUpdateNotes(participant.id, e.target.value)}
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
        <Paper sx={{ 
          flex: 1, 
          p: 2,
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedParticipant ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h5">
                    {selectedParticipant.id === currentParticipant?.id 
                      ? `Current Turn: ${selectedParticipant.character.name}`
                      : selectedParticipant.character.name
                    }
                  </Typography>
                  {selectedParticipant.id !== currentParticipant?.id && (
                    <Typography variant="caption" color="text.secondary">
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
                  <Card sx={{ backgroundColor: 'rgba(40, 40, 40, 0.9)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Character Details
                      </Typography>
                      <Typography variant="body1">
                        Type: {selectedParticipant.character.type.toUpperCase()}
                      </Typography>
                      <Typography variant="body1">
                        HP: {displayHp(selectedParticipant.currentHp)}/{selectedParticipant.maxHp}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {selectedParticipant.character.descriptionType === 'markdown' && (
                          <Box 
                            sx={{ 
                              maxHeight: '200px', 
                              overflow: 'auto',
                              cursor: 'pointer',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 1,
                              p: 1,
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                              }
                            }}
                            onClick={() => {
                              setCurrentMarkdownTitle(selectedParticipant.character.name);
                              setCurrentMarkdownContent(selectedParticipant.character.description);
                              setMarkdownDialogOpen(true);
                            }}
                          >
                            <MarkdownContent content={selectedParticipant.character.description} />
                          </Box>
                        )}
                        {selectedParticipant.character.descriptionType === 'image' && selectedParticipant.character.descriptionAssetName && (
                          <Box sx={{ mt: 1, maxHeight: '200px', overflow: 'hidden' }}>
                            <AssetViewer 
                              assetName={selectedParticipant.character.descriptionAssetName} 
                              height="200px"
                              width="100%"
                            />
                          </Box>
                        )}
                        {selectedParticipant.character.descriptionType === 'pdf' && selectedParticipant.character.descriptionAssetName && (
                          <Box sx={{ 
                            mt: 1, 
                            p: 1,
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Typography variant="body2" color="text.secondary">
                              {selectedParticipant.character.description}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={{ ml: 'auto' }}
                              onClick={() => handleViewPdf(selectedParticipant.character.descriptionAssetName || '')}
                            >
                              View PDF
                            </Button>
                          </Box>
                        )}
                        {(!selectedParticipant.character.descriptionType || 
                          (selectedParticipant.character.descriptionType !== 'markdown' && 
                           selectedParticipant.character.descriptionType !== 'image' && 
                           selectedParticipant.character.descriptionType !== 'pdf')) && (
                          <Typography variant="body2">
                            {selectedParticipant.character.description}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* HP adjustment controls */}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>Adjust HP</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              const currentHp = displayHp(selectedParticipant.currentHp);
                              handleUpdateHp(selectedParticipant.id, Math.max(0, currentHp - 1));
                            }}
                          >
                            -1
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              const currentHp = displayHp(selectedParticipant.currentHp);
                              handleUpdateHp(selectedParticipant.id, Math.max(0, currentHp - 5));
                            }}
                          >
                            -5
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            size="small"
                            onClick={() => {
                              const currentHp = displayHp(selectedParticipant.currentHp);
                              handleUpdateHp(selectedParticipant.id, Math.min(selectedParticipant.maxHp, currentHp + 1));
                            }}
                          >
                            +1
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            size="small"
                            onClick={() => {
                              const currentHp = displayHp(selectedParticipant.currentHp);
                              handleUpdateHp(selectedParticipant.id, Math.min(selectedParticipant.maxHp, currentHp + 5));
                            }}
                          >
                            +5
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: 'rgba(40, 40, 40, 0.9)', height: '100%' }}>
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
                    <Card sx={{ backgroundColor: 'rgba(40, 40, 40, 0.9)' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6">No participants in combat</Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Add participant dialog */}
      <Dialog 
        open={isAddParticipantDialogOpen} 
        onClose={() => setIsAddParticipantDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Combat Participant</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={characters}
              value={characters.find(char => char.id === newParticipantId) || null}
              onChange={(_, newValue) => {
                setNewParticipantId(newValue?.id || '');
              }}
              getOptionLabel={(option) => `${option.name} (${option.type}) - HP: ${option.hp}`}
              renderOption={(props, option) => {
                // Extract the key from props
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.type === 'npc' ? <PersonIcon color="primary" sx={{ mr: 1 }} /> : 
                       option.type === 'merchant' ? <StoreIcon color="secondary" sx={{ mr: 1 }} /> :
                       option.type === 'enemy' ? <SportsKabaddiIcon color="error" sx={{ mr: 1 }} /> :
                       <PersonIcon color="success" sx={{ mr: 1 }} />}
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.type.toUpperCase()} • HP: {option.hp}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Character"
                  fullWidth
                  helperText="Select a character to add to combat"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            
            <TextField
              label="Initiative"
              value={newParticipantInitiative}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for easier editing
                if (value === '') {
                  setNewParticipantInitiative('');
                } else {
                  const parsed = parseInt(value);
                  if (!isNaN(parsed)) {
                    setNewParticipantInitiative(parsed);
                  }
                }
              }}
              onBlur={() => {
                // When field loses focus, ensure we have a valid number
                if (newParticipantInitiative === '' || typeof newParticipantInitiative === 'string') {
                  setNewParticipantInitiative(0);
                }
              }}
              fullWidth
              helperText="Higher initiative goes first"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddParticipantDialogOpen(false)}>Cancel</Button>
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
      
      {/* Add PDF Viewer Dialog at the end */}
      <Dialog 
        open={pdfViewerOpen} 
        onClose={() => setPdfViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
          p: 1.5,
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" component="div">
              {currentPdfAsset}
            </Typography>
            <IconButton 
              onClick={() => setPdfViewerOpen(false)}
              size="small"
              edge="end"
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '75vh' }}>
          {currentPdfAsset && (
            <PDFViewer 
              assetName={currentPdfAsset} 
              height="100%" 
              width="100%" 
              allowDownload={true}
              showTopBar={false}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Markdown Content Dialog */}
      <Dialog 
        open={markdownDialogOpen} 
        onClose={() => setMarkdownDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'rgba(40, 40, 40, 0.95)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)', 
          p: 1.5,
          bgcolor: 'rgba(30, 30, 30, 0.9)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" component="div" sx={{ color: 'white' }}>
              {currentMarkdownTitle}
            </Typography>
            <IconButton 
              onClick={() => setMarkdownDialogOpen(false)}
              size="small"
              edge="end"
              aria-label="close"
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, height: '70vh', overflow: 'auto', color: 'white' }}>
          <MarkdownContent 
            content={currentMarkdownContent} 
            sx={{
              '& table': {
                display: 'block',
                width: '100%',
                overflow: 'auto',
                marginBottom: 2,
                borderCollapse: 'collapse',
              },
              '& th, & td': {
                px: 2,
                py: 1,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              '& th': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 3,
                mb: 2,
                color: 'white',
              },
              '& p': {
                mb: 2,
                color: 'white',
              },
              '& ul, & ol': {
                ml: 2,
                mb: 2,
              },
              '& a': {
                color: '#90caf9',
              }
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add the loot dialog */}
      <Dialog 
        open={lootDialogOpen} 
        onClose={() => setLootDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {defeatedEnemy ? `Loot from ${defeatedEnemy.name}` : 'Loot'}
        </DialogTitle>
        <DialogContent>
          {currentLoot.length > 0 ? (
            <List>
              {currentLoot.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText 
                    primary={item.name} 
                    secondary={
                      <>
                        {item.description}
                        <Box sx={{ mt: 1 }}>
                          <strong>Quantity:</strong> {item.quantity}
                          {item.price !== undefined && (
                            <span style={{ marginLeft: '1rem' }}>
                              <strong>Price:</strong> {item.price}
                            </span>
                          )}
                        </Box>
                      </>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No loot available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLootDialogOpen(false)}>Close</Button>
          <Button 
            onClick={handleCollectLoot} 
            color="primary" 
            variant="contained"
          >
            Collect All
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add rewards dialog */}
      <Dialog 
        open={showCombatRewards} 
        onClose={() => setShowCombatRewards(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 205, 86, 0.3)',
          background: 'linear-gradient(to right, rgba(255, 205, 86, 0.1), transparent)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star sx={{ color: 'gold', mr: 1 }} />
            <Typography variant="h6">Combat Rewards</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {(!combat.rewards || combat.rewards.length === 0) ? (
            <Typography sx={{ py: 3, textAlign: 'center' }}>
              No rewards available for this combat.
            </Typography>
          ) : (
            <List sx={{ mt: 1 }}>
              {combat.rewards.map((item) => (
                <ListItem 
                  key={item.id}
                  divider
                >
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1">{item.name}</Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                          <Chip 
                            label={`Quantity: ${item.quantity}`} 
                            size="small" 
                            variant="outlined" 
                          />
                          {item.price !== undefined && (
                            <Chip 
                              label={`Value: ${item.price}`} 
                              size="small" 
                              variant="outlined" 
                              color="secondary"
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCombatRewards(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCollectAllRewards}
            startIcon={<AddCircleIcon />}
          >
            Collect All Rewards
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 