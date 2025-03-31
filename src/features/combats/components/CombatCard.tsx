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
      case 'easy': return 'success';
      case 'medium': return 'primary';
      case 'hard': return 'warning';
      case 'deadly': return 'error';
      default: return 'primary';
    }
  };
  
  // Start combat
  const handleStartCombat = () => {
    navigate(`/combat-session?id=${combat.id}`);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardContent className="flex-grow flex flex-col">
        <Box className="flex justify-between items-start mb-2">
          <Typography variant="h6" component="h2">
            {combat.name}
          </Typography>
          <Chip
            size="small"
            color={getDifficultyColor(combat.difficulty)}
            label={formatDifficulty(combat.difficulty)}
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" className="mb-2">
          {locationName}
        </Typography>
        
        {combat.description && (
          <Box className="mb-3 flex-grow overflow-hidden">
            <div className="line-clamp-3">
              <MarkdownContent content={combat.description || ''} />
            </div>
          </Box>
        )}
        
        <Box className="mt-auto">
          {combat.playerCharacters.length > 0 && (
            <Box className="mb-2">
              <Typography variant="caption" className="block mb-1 font-semibold">
                Players:
              </Typography>
              <Box className="flex flex-wrap gap-1">
                {combat.playerCharacters.map(player => (
                  <Chip
                    key={player.id}
                    size="small"
                    color="default"
                    label={player.name}
                    className="mb-1"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {combat.enemies.length > 0 && (
            <Box>
              <Typography variant="caption" className="block mb-1 font-semibold">
                Enemies:
              </Typography>
              <Box className="flex flex-wrap gap-1">
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
                    color="error"
                    label={count > 1 ? `${name} (${count})` : name}
                    className="mb-1"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions className="justify-between">
        <Box>
          <Tooltip title="Edit combat">
            <IconButton 
              size="small"
              onClick={() => onEditClick(combat)}
            >
              <EditIcon className="text-sm" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete combat">
            <IconButton
              size="small"
              onClick={() => onDeleteClick(combat.id)}
            >
              <DeleteIcon className="text-sm" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleStartCombat}
        >
          Start Combat
        </Button>
      </CardActions>
    </Card>
  );
}; 