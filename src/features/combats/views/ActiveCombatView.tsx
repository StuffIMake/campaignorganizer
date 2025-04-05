import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  IconButton,
  Grid,
  Chip
} from '../../../components/ui';
import { useCombatSession } from '../hooks/useCombatSession';
import { CombatParticipantList } from '../components/CombatParticipantList';
import { CombatParticipantDetails } from '../components/CombatParticipantDetails';
import { AddParticipantDialog } from '../components/AddParticipantDialog';
import { useStore } from '../../../store';
import { ArrowBackIcon } from '../../../assets/icons';

// Custom arrow forward icon for next turn button
const ArrowForwardIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
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

/**
 * ActiveCombatView component - Space-efficient version
 */
export const ActiveCombatView: React.FC = () => {
  const {
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
  } = useCombatSession();
  
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const characters = useStore(state => state.characters);
  
  // Guard for missing combat data
  if (!combat) {
    return (
      <div className="max-w-full h-full p-2">
        <div className="glass-effect rounded-lg p-4 text-center">
          <Typography variant="h5" className="font-display text-base font-semibold">Combat not found</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onPress={handleClose}
            className="mt-2 text-sm py-1"
          >
            Back to Combat List
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact header */}
      <div className="glass-effect border-b border-border-DEFAULT/20 px-3 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <IconButton 
              aria-label="Back"
              onClick={handleClose}
              className="mr-2 p-1"
            >
              <ArrowBackIcon className="w-4 h-4 text-primary-light" />
            </IconButton>
            <h1 className="font-display font-semibold text-base bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent truncate">
              {combat.name || 'Untitled Combat'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Chip 
              label={`Round ${round}`} 
              color="primary" 
              variant="outlined"
              className="text-xs py-0.5 px-2"
            />
            <Button 
              variant="contained" 
              color="primary"
              onPress={nextTurn}
              endIcon={<ArrowForwardIcon />}
              isDisabled={participants.length === 0}
              className="text-xs py-1 px-2"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content - flexible layout */}
      <div className="flex flex-grow overflow-hidden">
        {/* Slim left sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-border-DEFAULT/20 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-3 py-2 bg-background-surface/30 border-b border-border-DEFAULT/20">
            <h2 className="font-display font-medium text-sm text-text-primary">Participants</h2>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              onPress={() => setAddParticipantDialog(true)}
              className="text-xs py-0.5 px-2 min-w-0"
            >
              Add
            </Button>
          </div>
          
          <div className="flex-grow overflow-auto">
            {participants.length > 0 ? (
              <CombatParticipantList
                participants={participants}
                currentTurnIndex={currentTurnIndex}
                selectedParticipantId={selectedParticipantId}
                onSelectParticipant={selectParticipant}
              />
            ) : (
              <div className="text-center p-3">
                <p className="text-xs text-text-secondary">
                  No participants yet. Click "Add" to begin.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Flexible right content area */}
        <div className="flex-grow overflow-hidden">
          {selectedParticipant ? (
            <CombatParticipantDetails
              participant={selectedParticipant}
              onUpdateHp={updateHp}
              onUpdateNotes={updateNotes}
              onRemoveParticipant={removeParticipant}
              onUpdateInitiative={updateInitiative}
              isEditing={editingParticipantId === selectedParticipant.id}
              onSetEditing={(isEditing) => 
                setEditingParticipantId(isEditing ? selectedParticipant.id : null)
              }
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center px-4 py-6">
                <div className="text-primary-light/50 mb-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mx-auto"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary">
                  Select a participant
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add participant dialog */}
      <AddParticipantDialog
        open={addParticipantDialog}
        onClose={() => setAddParticipantDialog(false)}
        onAddParticipant={addParticipant}
        characters={characters}
      />
    </div>
  );
}; 