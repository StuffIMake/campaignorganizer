import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  TextField, 
  IconButton,
  Box
} from '../../../components/ui';
import { DeleteIcon, AddIcon, RemoveIcon } from '../../../assets/icons';
import MarkdownContent from '../../../components/MarkdownContent';
import { CombatParticipant } from '../hooks/useCombatSession';

interface CombatParticipantDetailsProps {
  participant: CombatParticipant;
  onUpdateHp: (id: string, hp: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemoveParticipant: (id: string) => void;
  onUpdateInitiative: (id: string, initiative: number) => void;
  isEditing: boolean;
  onSetEditing: (isEditing: boolean) => void;
}

/**
 * Displays detailed information about a selected combat participant
 * with directly editable controls for stats and notes
 */
export const CombatParticipantDetails: React.FC<CombatParticipantDetailsProps> = ({
  participant,
  onUpdateHp,
  onUpdateNotes,
  onRemoveParticipant,
  onUpdateInitiative
}) => {
  // Local state for values
  const [hp, setHp] = useState(participant.currentHp);
  const [initiative, setInitiative] = useState(participant.initiative);
  const [notes, setNotes] = useState(participant.notes);
  
  // Track if there are unsaved changes
  const [hpChanged, setHpChanged] = useState(false);
  const [initiativeChanged, setInitiativeChanged] = useState(false);
  
  // Update local state when the participant changes
  useEffect(() => {
    setHp(participant.currentHp);
    setInitiative(participant.initiative);
    setNotes(participant.notes);
    setHpChanged(false);
    setInitiativeChanged(false);
  }, [participant]);

  // Handle HP changes
  const handleHpChange = (newHp: number) => {
    // Ensure HP is within 0 and maxHp
    const boundedHp = Math.max(0, Math.min(newHp, participant.maxHp));
    if (boundedHp !== hp) {
      setHp(boundedHp);
      setHpChanged(true);
    }
  };
  
  // Save changes on blur or enter
  const handleHpBlur = () => {
    if (hpChanged) {
      onUpdateHp(participant.id, hp);
      setHpChanged(false);
    }
  };
  
  // Handle initiative changes
  const handleInitiativeChange = (newInitiative: number) => {
    setInitiative(newInitiative);
    setInitiativeChanged(true);
  };
  
  // Save initiative changes
  const handleInitiativeBlur = () => {
    if (initiativeChanged) {
      onUpdateInitiative(participant.id, initiative);
      setInitiativeChanged(false);
    }
  };
  
  // Save notes after a short delay
  const handleNotesChange = (value: string) => {
    setNotes(value);
    // Debounce the update to avoid excessive saves
    const timeoutId = setTimeout(() => {
      onUpdateNotes(participant.id, value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };
  
  // HP Adjustment buttons
  const HpAdjuster = () => (
    <div className="flex items-center">
      <IconButton 
        aria-label="Decrease HP" 
        size="small"
        onClick={() => handleHpChange(hp - 1)}
        className="bg-background-elevated/30 hover:bg-background-elevated/60"
      >
        <RemoveIcon className="w-3 h-3" />
      </IconButton>
      
      <input
        type="number"
        value={hp}
        onChange={(e) => handleHpChange(Number(e.target.value))}
        onBlur={handleHpBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleHpBlur()}
        aria-label="Current HP"
        className="w-12 mx-1 p-1 text-center bg-background-elevated/20 rounded border border-border-DEFAULT/30 focus:border-primary-DEFAULT/70 focus:outline-none"
      />
      
      <IconButton 
        aria-label="Increase HP" 
        size="small"
        onClick={() => handleHpChange(hp + 1)}
        className="bg-background-elevated/30 hover:bg-background-elevated/60"
      >
        <AddIcon className="w-3 h-3" />
      </IconButton>
      
      <span className="ml-1 text-sm text-text-secondary">/ {participant.maxHp}</span>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col overflow-auto">
      <Card className="flex-grow overflow-auto glass-effect">
        <CardContent>
          <div className="flex justify-between items-center mb-3">
            <Typography variant="h6" component="h2" className="font-display">
              {participant.character.name}
            </Typography>
            
            <IconButton
              aria-label="Remove"
              onClick={() => onRemoveParticipant(participant.id)}
              size="small"
              color="error"
              className="hover:bg-error-DEFAULT/20"
            >
              <DeleteIcon />
            </IconButton>
          </div>
          
          <Divider className="mb-3" />
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Typography variant="subtitle2" component="span" className="block text-sm text-text-secondary">
                HP:
              </Typography>
              <HpAdjuster />
            </div>
            
            <div>
              <Typography variant="subtitle2" component="span" className="block text-sm text-text-secondary">
                Initiative:
              </Typography>
              <input
                type="number"
                value={initiative}
                onChange={(e) => handleInitiativeChange(Number(e.target.value))}
                onBlur={handleInitiativeBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleInitiativeBlur()}
                aria-label="Initiative value"
                className="w-full p-1 bg-background-elevated/20 rounded border border-border-DEFAULT/30 focus:border-primary-DEFAULT/70 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <Typography variant="subtitle2" component="span" className="block text-sm text-text-secondary">
              Type:
            </Typography>
            <Typography variant="body1" component="span" className="font-medium">
              {participant.character.type}
            </Typography>
          </div>
          
          <Divider className="mb-3" />
          
          {participant.character.description && (
            <Box className="mb-3">
              <Typography variant="subtitle2" className="mb-1 text-sm text-text-secondary">
                Description:
              </Typography>
              
              <Box className="p-2 bg-background-elevated/20 rounded-md">
                <MarkdownContent content={participant.character.description} />
              </Box>
            </Box>
          )}
          
          <Typography variant="subtitle2" className="mb-1 text-sm text-text-secondary">
            Combat Notes:
          </Typography>
          
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add combat notes here..."
            aria-label="Combat notes"
            className="w-full p-2 bg-background-elevated/20 rounded-md border border-border-DEFAULT/30 focus:border-primary-DEFAULT/70 focus:outline-none min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}; 