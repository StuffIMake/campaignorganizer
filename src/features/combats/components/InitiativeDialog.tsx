import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Button,
  TextField,
  Select,
  Box,
  Card,
  Divider,
  IconButton
} from '../../../components/ui';
import { CombatParticipant } from '../hooks/useCombatSession';

export interface InitiativeDialogProps {
  open: boolean;
  onClose: () => void;
  participants: CombatParticipant[];
  onComplete: (updatedParticipants: CombatParticipant[]) => void;
  title?: string;
  isSingleParticipant?: boolean;
  onViewCharacterDetails?: (participant: CombatParticipant) => void;
}

interface DiceOption {
  label: string;
  value: string;
  description: string;
}

const DICE_OPTIONS: DiceOption[] = [
  { label: '', value: 'd20', description: '1d20 (avg: 10.5)' },
  { label: '', value: 'd12', description: '1d12 (avg: 6.5)' },
  { label: '', value: 'd10', description: '1d10 (avg: 5.5)' },
  { label: '', value: 'd8', description: '1d8 (avg: 4.5)' },
  { label: '', value: 'd6', description: '1d6 (avg: 3.5)' },
  { label: '', value: 'd4', description: '1d4 (avg: 2.5)' },
];

/**
 * Dialog for setting initiative values for all participants at the start of combat
 * or for a single new participant
 */
export const InitiativeDialog: React.FC<InitiativeDialogProps> = ({
  open,
  onClose,
  participants,
  onComplete,
  title = 'Set Initiative',
  isSingleParticipant = false,
  onViewCharacterDetails
}) => {
  // Clone participants array to make modifications - use useEffect to update when props change
  const [localParticipants, setLocalParticipants] = useState<CombatParticipant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initiativeValue, setInitiativeValue] = useState('');
  const [diceOption, setDiceOption] = useState<string>('d20');
  const [bonusValue, setBonusValue] = useState('0');
  
  // Update local state when props change
  useEffect(() => {
    if (open && participants && participants.length > 0) {
      setLocalParticipants([...participants]);
      setCurrentIndex(0);
    }
  }, [open, participants]);
  
  // Current participant being configured
  const currentParticipant = localParticipants[currentIndex];
  const isLastParticipant = currentIndex === localParticipants.length - 1;
  
  // Roll random initiative using selected dice
  const rollInitiative = () => {
    let result = 0;
    
    switch (diceOption) {
      case 'd20':
        result = Math.floor(Math.random() * 20) + 1;
        break;
      case 'd12':
        result = Math.floor(Math.random() * 12) + 1;
        break;
      case 'd10':
        result = Math.floor(Math.random() * 10) + 1;
        break;
      case 'd8':
        result = Math.floor(Math.random() * 8) + 1;
        break;
      case 'd6':
        result = Math.floor(Math.random() * 6) + 1;
        break;
      case 'd4':
        result = Math.floor(Math.random() * 4) + 1;
        break;
      default:
        result = Math.floor(Math.random() * 20) + 1;
    }
    
    // Add bonus
    const bonus = parseInt(bonusValue) || 0;
    result += bonus;
    
    // Debug log
    console.log(`Rolled initiative: ${result} (${diceOption} + ${bonus})`);
    
    // Ensure we never return 0 as initiative
    return Math.max(1, result);
  };
  
  // Set manual initiative value
  const setManualInitiative = (value: string) => {
    setInitiativeValue(value);
  };
  
  // Apply current initiative setting and move to next participant
  const applyCurrentInitiative = () => {
    if (!currentParticipant) return;
    
    const initiativeNum = initiativeValue ? parseInt(initiativeValue) : rollInitiative();
    
    // Debug log
    console.log(`Setting initiative for ${currentParticipant.character.name} to ${initiativeNum}`);
    
    // Create a deep copy of the participants array to prevent reference issues
    const updatedParticipants = JSON.parse(JSON.stringify(localParticipants));
    updatedParticipants[currentIndex] = {
      ...updatedParticipants[currentIndex],
      initiative: initiativeNum
    };
    
    setLocalParticipants(updatedParticipants);
    setInitiativeValue('');
    
    if (isLastParticipant) {
      // Final debug log
      console.log("All initiatives set:", updatedParticipants.map((p: CombatParticipant) => 
        `${p.character.name}: ${p.initiative}`
      ));
      
      // Sort by initiative and complete
      const sortedParticipants = [...updatedParticipants].sort((a, b) => 
        b.initiative - a.initiative
      );
      onComplete(sortedParticipants);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Apply quick roll using selected dice and bonus
  const quickRoll = () => {
    if (!currentParticipant) return;
    
    const result = rollInitiative();
    console.log(`Quick roll result for ${currentParticipant.character.name}: ${result}`);
    
    // Create a deep copy of the participants array to prevent reference issues
    const updatedParticipants = JSON.parse(JSON.stringify(localParticipants));
    updatedParticipants[currentIndex] = {
      ...updatedParticipants[currentIndex],
      initiative: result
    };
    
    setLocalParticipants(updatedParticipants);
    
    if (isLastParticipant) {
      // Final debug log
      console.log("All initiatives set:", updatedParticipants.map((p: CombatParticipant) => 
        `${p.character.name}: ${p.initiative}`
      ));
      
      // Sort by initiative and complete
      const sortedParticipants = [...updatedParticipants].sort((a, b) => 
        b.initiative - a.initiative
      );
      onComplete(sortedParticipants);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Immediately complete with random initiative for all
  const rollAllRandom = () => {
    console.log("Rolling for all participants");
    
    // Create a deep copy of the participants array to prevent reference issues
    const updatedParticipants = JSON.parse(JSON.stringify(localParticipants));
    
    // Set initiative for each participant
    updatedParticipants.forEach((participant: any, idx: number) => {
      const initiativeRoll = rollInitiative();
      console.log(`Rolling for ${participant.character.name}: ${initiativeRoll}`);
      updatedParticipants[idx].initiative = initiativeRoll;
    });
    
    // Sort by initiative
    const sortedParticipants = [...updatedParticipants].sort((a, b) => 
      b.initiative - a.initiative
    );
    
    console.log("Final initiative order:", sortedParticipants.map((p: CombatParticipant) => 
      `${p.character.name}: ${p.initiative}`
    ));
    
    // Update the full list at once
    onComplete(sortedParticipants);
  };
  
  // Cancel and close dialog
  const handleCancel = () => {
    setLocalParticipants([]);
    setCurrentIndex(0);
    setInitiativeValue('');
    onClose();
  };
  
  // Display message if no participants available
  if (open && (!localParticipants || localParticipants.length === 0)) {
    return (
      <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box className="p-4 text-center">
            <Typography>
              No participants available to set initiative.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onPress={handleCancel}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      
      <DialogContent>
        {currentParticipant ? (
          <Box className="mb-4">
            <Typography variant="h6" className="mb-2">
              {isSingleParticipant 
                ? "Set Initiative" 
                : `${currentIndex + 1}/${localParticipants.length}: Set Initiative`}
            </Typography>
            
            <Card className="p-4 mb-4">
              <Box className="flex justify-between items-center mb-2">
                <Box className="flex items-center">
                  <Typography variant="subtitle1" className="font-semibold mr-2">
                    {currentParticipant.character.name}
                  </Typography>
                  <Typography variant="body2" className="text-text-secondary">
                    ({currentParticipant.isPlayerCharacter ? 'Player Character' : 'NPC'})
                  </Typography>
                </Box>
                
                {onViewCharacterDetails && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    color="primary"
                    className="text-xs"
                    onPress={() => onViewCharacterDetails(currentParticipant)}
                  >
                    View Details
                  </Button>
                )}
              </Box>
              
              <Typography variant="body2" className="text-text-secondary mb-2">
                Type: {currentParticipant.character.type || (currentParticipant.isPlayerCharacter ? 'player' : 'enemy')}
              </Typography>
            </Card>
            
            <Typography variant="subtitle2" className="mb-2">
              Initiative Options
            </Typography>
            
            <Box className="mb-4">
              <Typography variant="body2" className="mb-2">
                Enter specific value:
              </Typography>
              <Box className="flex gap-2">
                <TextField
                  value={initiativeValue}
                  onChange={setManualInitiative}
                  placeholder="Initiative value"
                  type="number"
                  className="flex-1"
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onPress={applyCurrentInitiative}
                  isDisabled={!initiativeValue}
                >
                  Apply
                </Button>
              </Box>
            </Box>
            
            <Divider className="my-4" />
            
            <Typography variant="body2" className="mb-2">
              Or roll random initiative:
            </Typography>
            
            <Box className="grid grid-cols-2 gap-4 mb-4">
              <Box>
                <Typography variant="caption" className="block mb-1">
                  Dice Type
                </Typography>
                <select 
                  value={diceOption}
                  onChange={(e) => setDiceOption(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-background-input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {DICE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="dark:bg-gray-800 dark:text-white">
                      {option.description}
                    </option>
                  ))}
                </select>
              </Box>
              
              <Box>
                <Typography variant="caption" className="block mb-1">
                  Bonus
                </Typography>
                <TextField
                  value={bonusValue}
                  onChange={setBonusValue}
                  type="number"
                  className="w-full"
                />
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              className="w-full"
              onPress={quickRoll}
            >
              Roll and Continue
            </Button>
            
            {!isSingleParticipant && currentIndex === 0 && (
              <Box className="mt-4">
                <Button 
                  variant="outlined" 
                  color="secondary"
                  className="w-full"
                  onPress={rollAllRandom}
                >
                  Quick Mode: Roll for All Participants and Start
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box className="p-4 text-center">
            <Typography>
              Loading participant data...
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onPress={handleCancel}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}; 