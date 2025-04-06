import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField, 
  IconButton,
  Button,
  Grid,
  Tooltip
} from '../../../components/ui';
import { CloseIcon, EditIcon, SaveIcon, DeleteIcon, DownloadIcon } from '../../../assets/icons';
import MarkdownContent from '../../../components/MarkdownContent';
import { CombatParticipant } from '../hooks/useCombatSession';

export interface CombatParticipantDetailsProps {
  participant: CombatParticipant;
  onUpdateHp: (participantId: string, hp: number) => void;
  onUpdateNotes: (participantId: string, notes: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onUpdateInitiative: (participantId: string, initiative: number) => void;
  isEditing: boolean;
  onSetEditing: (isEditing: boolean) => void;
  onViewDescription?: () => void;
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
  onUpdateInitiative,
  isEditing,
  onSetEditing,
  onViewDescription
}) => {
  const [localHp, setLocalHp] = useState<number>(participant.currentHp);
  const [localInitiative, setLocalInitiative] = useState<number>(participant.initiative);
  const [localNotes, setLocalNotes] = useState<string>(participant.notes || '');
  
  const isDefeated = participant.isDefeated;
  const { character } = participant;
  const hasAsset = character.descriptionAssetName && 
                  (character.descriptionType === 'pdf' || character.descriptionType === 'image');
  
  useEffect(() => {
    setLocalHp(participant.currentHp);
    setLocalInitiative(participant.initiative);
    setLocalNotes(participant.notes || '');
  }, [participant]);
  
  const handleSave = () => {
    onUpdateHp(participant.id, localHp);
    onUpdateInitiative(participant.id, localInitiative);
    onUpdateNotes(participant.id, localNotes);
    onSetEditing(false);
  };
  
  const handleCancel = () => {
    setLocalHp(participant.currentHp);
    setLocalInitiative(participant.initiative);
    setLocalNotes(participant.notes || '');
    onSetEditing(false);
  };
  
  return (
    <div className="h-full flex flex-col overflow-auto p-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h2 className={`font-display text-base font-semibold ${isDefeated ? 'line-through text-red-500' : ''}`}>
            {character.name}
            {character.type && (
              <span className="ml-2 text-xs opacity-70">
                ({character.type})
              </span>
            )}
          </h2>
          
          {/* Edit and view PDF buttons */}
          <div className="flex ml-2">
            {hasAsset && onViewDescription && (
              <Tooltip 
                title={`View ${character.descriptionType?.toUpperCase() || 'Document'}`}
                placement="top"
              >
                <IconButton
                  onClick={onViewDescription}
                  aria-label={`View ${character.descriptionType || 'document'}`}
                  className="text-primary-light mr-1"
                >
                  <DownloadIcon className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            )}
            
            {!isEditing && (
              <IconButton
                onClick={() => onSetEditing(true)}
                aria-label="Edit"
              >
                <EditIcon className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          {isEditing ? (
            <>
              <Button
                variant="text"
                color="error"
                onPress={handleCancel}
                className="text-xs mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onPress={handleSave}
                className="text-xs"
                startIcon={<SaveIcon className="w-3 h-3" />}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              {hasAsset && onViewDescription && (
                <Button
                  variant="outlined"
                  color="primary"
                  onPress={onViewDescription}
                  className="text-xs mr-2"
                >
                  View {character.descriptionType === 'pdf' ? 'PDF' : 'Image'}
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onPress={() => onRemoveParticipant(participant.id)}
                className="text-xs"
                startIcon={<CloseIcon className="w-3 h-3" />}
              >
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Grid container spacing={2} className="mb-4">
        <Grid item xs={4}>
          <Card className="p-3 h-full">
            <Typography variant="subtitle2" className="font-semibold mb-1">HP</Typography>
            {isEditing ? (
              <TextField
                value={localHp.toString()}
                onChange={(e: any) => setLocalHp(parseInt(e.target.value) || 0)}
                onBlur={() => onUpdateHp(participant.id, localHp)}
                type="number"
                size="small"
                fullWidth
              />
            ) : (
              <div className="flex items-baseline">
                <span className={`text-lg font-bold ${participant.currentHp <= 0 ? 'text-red-500' : ''}`}>{participant.currentHp}</span>
                <span className="text-xs opacity-60 ml-1">/ {participant.maxHp}</span>
              </div>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={4}>
          <Card className="p-3 h-full">
            <Typography variant="subtitle2" className="font-semibold mb-1">Initiative</Typography>
            {isEditing ? (
              <TextField
                value={localInitiative.toString()}
                onChange={(e: any) => setLocalInitiative(parseInt(e.target.value) || 0)}
                onBlur={() => onUpdateInitiative(participant.id, localInitiative)}
                type="number"
                size="small"
                fullWidth
              />
            ) : (
              <span className="text-lg font-bold">{participant.initiative}</span>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={4}>
          <Card className="p-3 h-full">
            <Typography variant="subtitle2" className="font-semibold mb-1">Type</Typography>
            <span className="text-base">
              {participant.isPlayerCharacter ? 'PC' : 'NPC'}
            </span>
          </Card>
        </Grid>
      </Grid>
      
      <div className="flex-grow overflow-auto">
        <Card className="p-4 mb-4">
          <Typography variant="subtitle2" className="font-semibold mb-2">Notes</Typography>
          {isEditing ? (
            <TextField
              value={localNotes}
              onChange={(e: any) => {
                setLocalNotes(e.target.value);
                onUpdateNotes(participant.id, e.target.value);
              }}
              fullWidth
              InputProps={{
                inputProps: { style: { minHeight: '100px' } }
              }}
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              {participant.notes || <span className="opacity-50 italic">No notes</span>}
            </div>
          )}
        </Card>
        
        {character.description && (
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <Typography variant="subtitle2" className="font-semibold">Description</Typography>
              {onViewDescription && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  className="text-xs"
                  onPress={onViewDescription}
                >
                  View full description
                </Button>
              )}
            </div>
            <div className="description-preview max-h-48 overflow-y-auto">
              <MarkdownContent content={character.description} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 