import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Combat, Character, CustomLocation } from '../../../store';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Box, 
  Typography, 
  Chip,
  ButtonGroup,
  Button,
  Divider,
  IconButton,
  Tooltip
} from '../../../components/ui';
import { EditIcon, DeleteIcon, Star } from '../../../assets/icons';
import MarkdownContent from '../../../components/MarkdownContent';

interface CombatCardProps {
  combat: Combat;
  locations: CustomLocation[];
  onEditClick: (combat: Combat) => void;
  onDeleteClick: (combatId: string) => void;
}

export const CombatCard: React.FC<CombatCardProps> = ({
  combat,
  locations,
  onEditClick,
  onDeleteClick
}) => {
  const navigate = useNavigate();
  
  // Get the name of the location where this combat takes place
  const locationName = combat.locationId 
    ? locations.find(loc => loc.id === combat.locationId)?.name || 'Unknown Location' 
    : 'No Location Set';
  
  // Format difficulty for display
  const formatDifficulty = (difficulty: string | undefined): string => {
    if (!difficulty) return 'Medium';
    
    // Capitalize the first letter
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };
  
  // Get color for difficulty chip
  const getDifficultyColor = (difficulty: string | undefined) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-blue-500 to-indigo-600';
      case 'hard': return 'from-amber-500 to-orange-600';
      case 'deadly': return 'from-red-500 to-rose-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };
  
  // Get text color for difficulty
  const getDifficultyTextColor = (difficulty: string | undefined) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-blue-400';
      case 'hard': return 'text-amber-400';
      case 'deadly': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };
  
  // Start combat
  const handleStartCombat = () => {
    navigate(`/combat-session?id=${combat.id}`);
  };

  return (
    <Card 
      className="relative shadow-lg hover-lift transition-all duration-300 overflow-hidden h-full rounded-xl"
      data-testid={`combat-card-${combat.id}`}
      variant="glass"
    >
      {/* Colorful top border */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getDifficultyColor(combat.difficulty)}`}></div>
      
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <Typography variant="h5" className="font-display font-bold">
            {combat.name}
          </Typography>
          <Chip
            size="small"
            label={formatDifficulty(combat.difficulty)}
            className={`glass-effect-strong ${getDifficultyTextColor(combat.difficulty)}`}
          />
        </div>
        
        {locationName && (
          <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <Typography variant="body2" className="text-text-secondary">
              {locationName}
            </Typography>
          </div>
        )}
        
        {combat.description && (
          <div className="mb-4 flex-grow overflow-hidden">
            <div className="line-clamp-3 text-text-secondary text-sm">
              <MarkdownContent content={combat.description || ''} />
            </div>
          </div>
        )}
        
        <div className="mt-auto space-y-3">
          {combat.playerCharacters.length > 0 && (
            <div>
              <Typography variant="caption" className="block mb-1 font-semibold text-text-primary opacity-80">
                Players:
              </Typography>
              <div className="flex flex-wrap gap-1">
                {combat.playerCharacters.map(player => (
                  <Chip
                    key={player.id}
                    size="small"
                    label={player.name}
                    className="bg-primary-dark/20 text-primary-light text-xs"
                  />
                ))}
              </div>
            </div>
          )}
          
          {combat.enemies.length > 0 && (
            <div>
              <Typography variant="caption" className="block mb-1 font-semibold text-text-primary opacity-80">
                Enemies:
              </Typography>
              <div className="flex flex-wrap gap-1">
                {/* Group enemies by name and count */}
                {Object.entries(
                  combat.enemies.reduce((acc, enemy) => {
                    acc[enemy.name] = (acc[enemy.name] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([name, count]) => (
                  <Chip
                    key={name}
                    size="small"
                    label={count > 1 ? `${name} (${count})` : name}
                    className="bg-error-dark/20 text-error-light text-xs"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-1">
          <IconButton
            size="small" 
            onClick={() => onEditClick(combat)}
            className="text-text-secondary hover:text-primary-DEFAULT"
            data-testid={`edit-combat-${combat.id}`}
          >
            <EditIcon className="w-4 h-4" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDeleteClick(combat.id)}
            className="text-text-secondary hover:text-error-DEFAULT"
            data-testid={`delete-combat-${combat.id}`}
          >
            <DeleteIcon className="w-4 h-4" />
          </IconButton>
        </div>
        
        <Button
          variant="contained"
          color="primary"
          size="small"
          onPress={handleStartCombat}
          className="shadow-md btn-glow relative !bg-indigo-600 hover:!bg-indigo-700 active:!bg-indigo-800"
          data-testid={`start-combat-${combat.id}`}
        >
          Start Combat
        </Button>
      </div>
    </Card>
  );
}; 