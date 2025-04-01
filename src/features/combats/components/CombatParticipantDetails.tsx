import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  TextField, 
  Button,
  IconButton,
  Grid,
  Box
} from '../../../components/ui';
import { DeleteIcon, EditIcon } from '../../../assets/icons';
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
 * with controls to edit their stats and notes
 */
export const CombatParticipantDetails: React.FC<CombatParticipantDetailsProps> = ({
  participant,
  onUpdateHp,
  onUpdateNotes,
  onRemoveParticipant,
  onUpdateInitiative,
  isEditing,
  onSetEditing
}) => {
  // Local state for form values
  const [hp, setHp] = useState(participant.currentHp);
  const [initiative, setInitiative] = useState(participant.initiative);
  const [notes, setNotes] = useState(participant.notes);
  
  // Update local state when the participant changes
  React.useEffect(() => {
    setHp(participant.currentHp);
    setInitiative(participant.initiative);
    setNotes(participant.notes);
  }, [participant]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHp(participant.id, hp);
    onUpdateInitiative(participant.id, initiative);
    onUpdateNotes(participant.id, notes);
    onSetEditing(false);
  };
  
  return (
    <Card className="h-full">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" component="h2">
            {participant.character.name}
          </Typography>
          
          <div>
            <IconButton
              aria-label="Edit"
              onClick={() => onSetEditing(!isEditing)}
              size="small"
              className="mr-1"
            >
              <EditIcon />
            </IconButton>
            
            <IconButton
              aria-label="Remove"
              onClick={() => onRemoveParticipant(participant.id)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
        
        <Divider className="mb-4" />
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Current HP"
                  type="number"
                  fullWidth
                  value={hp}
                  onChange={(e) => setHp(Number(e.target.value))}
                  className="mb-3"
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  label="Initiative"
                  type="number"
                  fullWidth
                  value={initiative}
                  onChange={(e) => setInitiative(Number(e.target.value))}
                  className="mb-3"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={4}
                  fullWidth
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mb-3"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  className="mr-2"
                >
                  Save
                </Button>
                
                <Button 
                  type="button" 
                  variant="outlined"
                  onClick={() => onSetEditing(false)}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        ) : (
          <div>
            <div className="flex justify-between mb-4">
              <div>
                <Typography variant="subtitle2" component="span" className="block">
                  HP:
                </Typography>
                <Typography variant="body1" component="span" className="font-bold">
                  {participant.currentHp} / {participant.maxHp}
                </Typography>
              </div>
              
              <div>
                <Typography variant="subtitle2" component="span" className="block">
                  Initiative:
                </Typography>
                <Typography variant="body1" component="span" className="font-bold">
                  {participant.initiative}
                </Typography>
              </div>
              
              <div>
                <Typography variant="subtitle2" component="span" className="block">
                  Type:
                </Typography>
                <Typography variant="body1" component="span" className="font-bold">
                  {participant.character.type}
                </Typography>
              </div>
            </div>
            
            <Divider className="mb-4" />
            
            {participant.character.description && (
              <Box className="mb-4">
                <Typography variant="subtitle2" className="mb-1">
                  Description:
                </Typography>
                
                <Box className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <MarkdownContent content={participant.character.description} />
                </Box>
              </Box>
            )}
            
            <Typography variant="subtitle2" className="mb-1">
              Combat Notes:
            </Typography>
            
            <Box className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              {participant.notes ? (
                <Typography variant="body2">
                  {participant.notes}
                </Typography>
              ) : (
                <Typography variant="body2" className="text-gray-500 italic">
                  No notes added yet. Click edit to add notes.
                </Typography>
              )}
            </Box>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 