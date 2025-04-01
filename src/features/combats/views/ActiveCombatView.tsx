import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
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

/**
 * ActiveCombatView component
 * 
 * Displays the active combat session with participant list, details, and controls
 * for managing turns and participants
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
      <Paper className="p-8 m-4">
        <Typography variant="h5">Combat not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleClose}
          className="mt-4"
        >
          Back to Combat List
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box className="p-4">
      {/* Header */}
      <Paper className="p-4 mb-4">
        <Box className="flex justify-between items-center">
          <Box className="flex items-center">
            <IconButton 
              aria-label="Back"
              onClick={handleClose}
              className="mr-2"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {combat.title || 'Untitled Combat'}
            </Typography>
          </Box>
          
          <Box className="flex items-center">
            <Chip 
              label={`Round ${round}`} 
              color="primary" 
              variant="outlined"
              className="mr-2"
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={nextTurn}
              endIcon={<ArrowForwardIcon />}
              disabled={participants.length === 0}
            >
              Next Turn
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column - Participant list */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper className="p-4">
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6">Participants</Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                onClick={() => setAddParticipantDialog(true)}
              >
                Add
              </Button>
            </Box>
            
            {participants.length > 0 ? (
              <CombatParticipantList
                participants={participants}
                currentTurnIndex={currentTurnIndex}
                selectedParticipantId={selectedParticipantId}
                onSelectParticipant={selectParticipant}
              />
            ) : (
              <Typography variant="body2" className="text-center text-gray-500 p-4">
                No participants added yet. Click "Add" to begin.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Right column - Details */}
        <Grid item xs={12} md={8} lg={9}>
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
            <Paper className="p-8 text-center">
              <Typography>
                Select a participant to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Add participant dialog */}
      <AddParticipantDialog
        open={addParticipantDialog}
        onClose={() => setAddParticipantDialog(false)}
        onAddParticipant={addParticipant}
        characters={characters}
      />
    </Box>
  );
}; 