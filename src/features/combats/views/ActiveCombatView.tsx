import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  IconButton,
  Grid,
  Chip,
  Card,
  Tooltip,
  TextField
} from '../../../components/ui';
import { useCombatSession } from '../hooks/useCombatSession';
import { CombatParticipantList } from '../components/CombatParticipantList';
import { CombatParticipantDetails } from '../components/CombatParticipantDetails';
import { AddParticipantDialog } from '../components/AddParticipantDialog';
import { InitiativeDialog } from '../components/InitiativeDialog';
import { useStore } from '../../../store';
import { ArrowBackIcon } from '../../../assets/icons';
import { AssetViewerDialog } from '../../characters/components/AssetViewerDialog';

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
 * ActiveCombatView component - Optimized layout for combat management
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
    updateMultipleInitiatives,
    updateHp,
    updateNotes,
    removeParticipant,
    selectParticipant,
    setEditingParticipantId
  } = useCombatSession();
  
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const characters = useStore(state => state.characters);
  
  // Initiative setting dialogs
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [pendingParticipant, setPendingParticipant] = useState<any>(null);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);
  
  // Quick action states
  const [quickHpEdit, setQuickHpEdit] = useState<string>('');
  const [quickNotesEdit, setQuickNotesEdit] = useState<string>('');
  
  // Asset viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfAsset, setCurrentPdfAsset] = useState('');
  const [markdownDialogOpen, setMarkdownDialogOpen] = useState(false);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');
  const [currentMarkdownTitle, setCurrentMarkdownTitle] = useState('');

  // Function to view a PDF or image asset
  const viewPdf = (pdfAsset: string) => {
    setCurrentPdfAsset(pdfAsset);
    setPdfViewerOpen(true);
  };
  
  // Function to view markdown content
  const viewMarkdown = (content: string, title: string) => {
    setCurrentMarkdownContent(content);
    setCurrentMarkdownTitle(title);
    setMarkdownDialogOpen(true);
  };
  
  // Function to close asset viewer
  const closeAssetViewer = () => {
    setPdfViewerOpen(false);
    setMarkdownDialogOpen(false);
  };

  // Function to view participant description
  const viewParticipantDescription = (participant: any) => {
    if (!participant) return;
    
    const character = participant.character;
    
    if (character.descriptionType === 'pdf' && character.descriptionAssetName) {
      viewPdf(character.descriptionAssetName);
    } else if (character.descriptionType === 'image' && character.descriptionAssetName) {
      viewPdf(character.descriptionAssetName); // For images, we'll use the same viewer
    } else {
      // Default to markdown
      viewMarkdown(character.description || '', character.name);
    }
  };

  // Quick HP update with +/- values
  const applyQuickHpChange = () => {
    if (!selectedParticipant || !quickHpEdit) return;
    
    const value = parseInt(quickHpEdit);
    if (isNaN(value)) return;
    
    const newHp = quickHpEdit.startsWith('+') || quickHpEdit.startsWith('-') 
      ? selectedParticipant.currentHp + value 
      : value;
    
    updateHp(selectedParticipant.id, Math.max(0, Math.min(newHp, selectedParticipant.maxHp)));
    setQuickHpEdit('');
  };
  
  // Quick notes update
  const applyQuickNotesChange = () => {
    if (!selectedParticipant || !quickNotesEdit) return;
    const newNotes = selectedParticipant.notes 
      ? `${selectedParticipant.notes}\n${quickNotesEdit}` 
      : quickNotesEdit;
    
    updateNotes(selectedParticipant.id, newNotes);
    setQuickNotesEdit('');
  };
  
  // Remove a specific note
  const removeNote = (participantId: string, noteToRemove: string) => {
    if (!selectedParticipant) return;
    
    const noteLines = selectedParticipant.notes?.split('\n') || [];
    const updatedNotes = noteLines.filter(line => line !== noteToRemove).join('\n');
    
    updateNotes(participantId, updatedNotes);
  };

  // Set cursor position after prefixing input
  const setInputWithCursor = (prefix: string) => {
    setQuickHpEdit(prefix);
    // Delayed focus to ensure input is rendered with the new value
    setTimeout(() => {
      const input = document.getElementById('quickHpInput') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(prefix.length, prefix.length);
      }
    }, 50);
  };
  
  // Show initiative setup when combat first loads if participants exist
  useEffect(() => {
    if (combat && participants.length > 0 && !initialSetupComplete) {
      // Check if any participants have initiative 0 (default value)
      const needsInitiative = participants.some(p => p.initiative === 0);
      if (needsInitiative) {
        setInitiativeDialogOpen(true);
      } else {
        setInitialSetupComplete(true);
      }
    }
  }, [combat, participants, initialSetupComplete]);
  
  // Handle completing initiative setup
  const handleInitiativeComplete = (updatedParticipants: any[]) => {
    // Log all initiative values before updating
    console.log("Received updated participants with initiatives:", 
      updatedParticipants.map(p => `${p.character.name}: ${p.initiative}`));

    // Pending participant gets added separately
    if (pendingParticipant) {
      const newParticipant = updatedParticipants[0]; // Get the updated initiative
      console.log(`Adding new participant ${pendingParticipant.character.name} with initiative ${newParticipant.initiative}`);
      
      // Need to use the actual Character object for addParticipant
      const result = addParticipant(
        pendingParticipant.character.id,
        newParticipant.initiative,
        pendingParticipant.isPlayerCharacter
      );
      
      // Verify the participant was added successfully
      console.log("Add participant result:", result?.id ? "Success" : "Failed");
    } else {
      // Create an array of initiative updates in the required format
      const initiativeUpdates = updatedParticipants.map(p => ({
        id: p.id,
        initiative: p.initiative
      }));
      
      // Update all initiatives at once to avoid batching issues
      updateMultipleInitiatives(initiativeUpdates);
    }
    
    setInitiativeDialogOpen(false);
    setInitialSetupComplete(true);
    setPendingParticipant(null);
  };
  
  // Modified addParticipant handler to use the initiative dialog
  const handleAddParticipant = (characterId: string, initiative: number, isPlayerCharacter: boolean) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    const newParticipant = {
      id: `${isPlayerCharacter ? 'pc' : 'enemy'}-${character.id}-${Math.random().toString(36).substring(2, 9)}`,
      character,
      initiative: 0, // Will be set via initiative dialog
      currentHp: character.hp || 10,
      maxHp: character.hp || 10,
      notes: '',
      isPlayerCharacter
    };
    
    // Set as pending and open initiative dialog
    setPendingParticipant(newParticipant);
    setAddParticipantDialog(false);
    setInitiativeDialogOpen(true);
  };
  
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
          
          <div className="flex items-center gap-3">
            <Chip 
              label={`Round ${round}`} 
              color="primary" 
              variant="outlined"
              className="text-xs py-0.5 px-2"
            />
            {currentParticipant && (
              <div className="flex items-center">
                <Typography variant="body2" className="mr-2 text-sm">
                  Current Turn: <span className="font-semibold">{currentParticipant.character.name}</span>
                </Typography>
              </div>
            )}
            <Button 
              variant="contained" 
              color="primary"
              onPress={nextTurn}
              endIcon={<ArrowForwardIcon />}
              isDisabled={participants.length === 0}
              className="text-xs py-1 px-2"
            >
              Next Turn
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              onPress={() => setAddParticipantDialog(true)}
              className="text-xs py-0.5 px-2 min-w-0"
            >
              Add Participant
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content - efficient 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: Initiative order */}
        <div className="w-1/4 flex-shrink-0 border-r border-border-DEFAULT/20 flex flex-col overflow-hidden">
          <div className="bg-background-surface/30 px-3 py-2 border-b border-border-DEFAULT/20">
            <h2 className="font-display font-medium text-sm text-text-primary">Initiative Order</h2>
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
                  No participants yet
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Middle column: Active participant quick actions */}
        <div className="w-1/4 flex-shrink-0 border-r border-border-DEFAULT/20 flex flex-col overflow-hidden">
          <div className="bg-background-surface/30 px-3 py-2 border-b border-border-DEFAULT/20">
            <h2 className="font-display font-medium text-sm text-text-primary">Quick Actions</h2>
          </div>
          
          {currentParticipant && (
            <div className="p-3 flex flex-col gap-3 overflow-auto">
              <Card className="p-3">
                <Typography variant="subtitle2" className="font-semibold mb-2 text-primary-light">
                  Current Turn: {currentParticipant.character.name}
                </Typography>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-background-surface/30 p-2 rounded">
                    <Typography variant="caption" className="block text-text-secondary">HP</Typography>
                    <Typography variant="body1" className="font-semibold">
                      {currentParticipant.currentHp} / {currentParticipant.maxHp}
                    </Typography>
                  </div>
                  <div className="bg-background-surface/30 p-2 rounded">
                    <Typography variant="caption" className="block text-text-secondary">Type</Typography>
                    <Typography variant="body1" className="font-semibold">
                      {currentParticipant.isPlayerCharacter 
                        ? 'Player' 
                        : currentParticipant.character.type || 'Enemy'}
                    </Typography>
                  </div>
                </div>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onPress={() => viewParticipantDescription(currentParticipant)}
                  className="text-xs py-1 w-full"
                >
                  View Character Sheet
                </Button>
              </Card>
              
              {selectedParticipant && (
                <>
                  <Card className="p-3">
                    <Typography variant="subtitle2" className="font-semibold mb-2">
                      Modify HP for {selectedParticipant.character.name}
                    </Typography>
                    <div className="flex gap-1 mb-3">
                      <Tooltip title="Deal Damage">
                        <Button 
                          variant="outlined" 
                          color="error" 
                          className="flex-1 text-xs"
                          onPress={() => {
                            setInputWithCursor('-');
                          }}
                        >
                          Damage
                        </Button>
                      </Tooltip>
                      <Tooltip title="Heal">
                        <Button 
                          variant="outlined" 
                          color="success" 
                          className="flex-1 text-xs"
                          onPress={() => {
                            setInputWithCursor('+');
                          }}
                        >
                          Heal
                        </Button>
                      </Tooltip>
                    </div>
                    
                    <div className="flex gap-1">
                      <TextField
                        id="quickHpInput"
                        value={quickHpEdit}
                        onChange={(value) => setQuickHpEdit(value)}
                        placeholder="e.g. -5, +10, or 25"
                        size="small"
                        className="flex-1"
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter') applyQuickHpChange();
                        }}
                      />
                      <Button 
                        variant="contained" 
                        color="primary"
                        onPress={applyQuickHpChange}
                        isDisabled={!quickHpEdit}
                        className="text-xs"
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <Typography variant="subtitle2" className="font-semibold mb-2">
                      Add Notes
                    </Typography>
                    <TextField
                      value={quickNotesEdit}
                      onChange={(value) => setQuickNotesEdit(value)}
                      placeholder="Quick notes..."
                      size="small"
                      multiline
                      rows={2}
                      fullWidth
                      className="mb-2"
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' && e.ctrlKey) applyQuickNotesChange();
                      }}
                    />
                    <Button 
                      variant="contained" 
                      color="primary"
                      onPress={applyQuickNotesChange}
                      isDisabled={!quickNotesEdit}
                      className="text-xs w-full mb-3"
                    >
                      Add Note
                    </Button>
                    
                    {/* Display existing notes with delete option */}
                    {selectedParticipant?.notes && (
                      <div className="mt-2">
                        <Typography variant="caption" className="block text-text-secondary mb-1">
                          Existing Notes:
                        </Typography>
                        <div className="max-h-40 overflow-y-auto bg-background-surface/30 rounded p-2">
                          {selectedParticipant.notes.split('\n').filter(note => note.trim()).map((note, index) => (
                            <div key={index} className="flex justify-between items-center py-1 px-1 rounded mb-1 hover:bg-background-surface group">
                              <Typography variant="body2" className="text-xs break-words flex-grow mr-2">
                                {note}
                              </Typography>
                              <IconButton 
                                onClick={() => removeNote(selectedParticipant.id, note)}
                                aria-label="Remove note"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="text-red-500"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          )}
          
          {!currentParticipant && (
            <div className="flex items-center justify-center h-full">
              <Typography variant="body2" className="text-text-secondary">
                Start combat to activate quick actions
              </Typography>
            </div>
          )}
        </div>
        
        {/* Right column: Selected participant details */}
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
              onViewDescription={() => viewParticipantDescription(selectedParticipant)}
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
        onAddParticipant={handleAddParticipant}
        characters={characters}
      />
      
      {/* Initiative setting dialog */}
      <InitiativeDialog
        open={initiativeDialogOpen}
        onClose={() => {
          if (pendingParticipant) {
            // If we're setting initiative for a new participant and user cancels,
            // don't add the participant at all
            setPendingParticipant(null);
          }
          setInitiativeDialogOpen(false);
        }}
        participants={pendingParticipant ? [pendingParticipant] : participants}
        onComplete={handleInitiativeComplete}
        isSingleParticipant={!!pendingParticipant}
        title={pendingParticipant ? "Set Initiative for New Participant" : "Set Initiative"}
        onViewCharacterDetails={viewParticipantDescription}
      />

      {/* Asset viewer dialog */}
      <AssetViewerDialog
        pdfViewerOpen={pdfViewerOpen}
        markdownDialogOpen={markdownDialogOpen}
        currentPdfAsset={currentPdfAsset}
        currentMarkdownContent={currentMarkdownContent}
        currentMarkdownTitle={currentMarkdownTitle}
        onClose={closeAssetViewer}
      />
    </div>
  );
}; 