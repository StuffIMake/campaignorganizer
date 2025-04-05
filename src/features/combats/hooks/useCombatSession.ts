import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../store';
import { Combat, Character } from '../../../store';
import { useAudioPlayer } from '../../audio/hooks/useAudioPlayer';

/**
 * Interface for combat participants with initiative
 */
export interface CombatParticipant {
  id: string;
  character: Character;
  initiative: number;
  currentHp: number;
  maxHp: number;
  notes: string;
  isPlayerCharacter: boolean;
  isDefeated?: boolean;
}

/**
 * Custom hook that manages the state and logic for an active combat session
 * 
 * @returns Combat session state and functions
 */
export const useCombatSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    combats, 
    characters, 
  } = useStore();
  
  // Get audio functions from the hook
  const { play, stop } = useAudioPlayer();
  
  // Get the combat ID from the URL search params (e.g., ?id=123)
  const searchParams = new URLSearchParams(location.search);
  const combatId = searchParams.get('id');
  
  // Find the combat by ID
  const combat = combats.find(c => c.id === combatId);
  
  // Combat state
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  
  // Audio tracking
  const entrySoundRef = useRef<string | null>(null);
  const bgmTrackRef = useRef<string | null>(null);
  const audioInitialized = useRef(false);
  
  // If no combat is found, redirect back to combats view
  useEffect(() => {
    if (!combatId || !combat) {
      navigate('/combats');
    }
  }, [combatId, combat, navigate]);
  
  // Initialize audio when component mounts
  useEffect(() => {
    if (combat && !audioInitialized.current) {
      if (combat.entrySound) {
        const entryTrackId = `/audio/${combat.entrySound}`;
        entrySoundRef.current = entryTrackId;
        play(entryTrackId, { 
          replace: false, 
          locationId: `combat-entrysound-${combat.id}`, 
          loop: false 
        });
      }
      
      if (combat.backgroundMusic) {
        const bgmTrackId = `/audio/${combat.backgroundMusic}`;
        bgmTrackRef.current = bgmTrackId;
        play(bgmTrackId, { 
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
        stop(entrySoundRef.current);
        entrySoundRef.current = null;
      }
      
      if (bgmTrackRef.current) {
        stop(bgmTrackRef.current);
        bgmTrackRef.current = null;
      }
    };
  }, [combat, play, stop]);
  
  // Initialize combat participants
  useEffect(() => {
    if (combat) {
      initializeCombat();
    }
  }, [combat]);
  
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
    if (!combat) return;
    
    // Create participants from player characters
    const playerParticipants = combat.playerCharacters.map((pc: { id: string }) => {
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
    const enemyParticipants = combat.enemies.map((enemy: { id: string }) => {
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
  const addParticipant = (characterId: string, initiative: number, isPlayerCharacter: boolean) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    const newParticipant: CombatParticipant = {
      id: `${isPlayerCharacter ? 'pc' : 'enemy'}-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
      character,
      initiative,
      currentHp: character.hp || 10,
      maxHp: character.hp || 10,
      notes: '',
      isPlayerCharacter
    };
    
    // Add to participants and sort by initiative
    const newParticipants = [...participants, newParticipant]
      .sort((a, b) => b.initiative - a.initiative);
    
    setParticipants(newParticipants);
    
    // Adjust currentTurnIndex if the new participant has a higher initiative
    // than the current participant
    const currentParticipantInitiative = participants[currentTurnIndex]?.initiative || 0;
    if (initiative > currentParticipantInitiative) {
      const newIndex = newParticipants.findIndex(p => p.id === newParticipant.id);
      setCurrentTurnIndex(newIndex);
      setSelectedParticipantId(newParticipant.id);
    }
    
    return newParticipant;
  };

  // Update the initiative of a participant
  const updateInitiative = (participantId: string, initiative: number) => {
    const updatedParticipants = participants.map(p => 
      p.id === participantId 
        ? { ...p, initiative }
        : p
    ).sort((a, b) => b.initiative - a.initiative);
    
    // Find new index of current turn participant
    const currentParticipantId = participants[currentTurnIndex]?.id;
    const newCurrentTurnIndex = updatedParticipants.findIndex(p => p.id === currentParticipantId);
    
    setParticipants(updatedParticipants);
    setCurrentTurnIndex(newCurrentTurnIndex >= 0 ? newCurrentTurnIndex : 0);
  };

  // Update the HP of a participant
  const updateHp = (participantId: string, hp: number) => {
    const updatedParticipants = participants.map(p => 
      p.id === participantId 
        ? { 
            ...p, 
            currentHp: hp,
            isDefeated: hp <= 0
          }
        : p
    );
    
    setParticipants(updatedParticipants);
  };

  // Update the notes of a participant
  const updateNotes = (participantId: string, notes: string) => {
    const updatedParticipants = participants.map(p => 
      p.id === participantId 
        ? { ...p, notes }
        : p
    );
    
    setParticipants(updatedParticipants);
  };

  // Remove a participant from combat
  const removeParticipant = (participantId: string) => {
    // If removing the currently selected participant, select the current turn participant
    if (selectedParticipantId === participantId) {
      const currentParticipantId = participants[currentTurnIndex]?.id;
      setSelectedParticipantId(
        currentParticipantId !== participantId ? currentParticipantId : null
      );
    }
    
    // If removing the current turn participant, keep the same index (or adjust if it's the last one)
    const isCurrentTurn = participants[currentTurnIndex]?.id === participantId;
    const updatedParticipants = participants.filter(p => p.id !== participantId);
    
    if (isCurrentTurn) {
      // If it was the last participant, go back to index 0
      if (currentTurnIndex >= updatedParticipants.length) {
        setCurrentTurnIndex(0);
      }
      // Otherwise keep the same index, which will now point to the next participant
    }
    
    setParticipants(updatedParticipants);
  };
  
  // Select a participant for viewing details
  const selectParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
  };
  
  // Handle ending the combat session
  const handleClose = () => {
    navigate('/combats');
  };
  
  return {
    combat,
    participants,
    currentTurnIndex,
    currentParticipant,
    selectedParticipant,
    selectedParticipantId,
    round,
    editingParticipantId,
    handleClose,
    nextTurn,
    addParticipant,
    updateInitiative,
    updateHp,
    updateNotes,
    removeParticipant,
    selectParticipant,
    setEditingParticipantId
  };
}; 