import React from 'react';
import { List, ListItem, Typography, Avatar, Box, Chip } from '../../../components/ui';
import { CombatParticipant } from '../hooks/useCombatSession';

/**
 * Badge component for initiative display
 */
interface BadgeProps {
  content: React.ReactNode;
  color?: 'primary' | 'error' | string;
  className?: string;
}

const InitiativeBadge: React.FC<BadgeProps> = ({ content, color = "primary", className = "" }) => (
  <div className={`relative inline-flex items-center ${className}`}>
    <span className={`absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs text-white rounded-full ${color === 'primary' ? 'bg-blue-500' : 'bg-red-500'}`}>
      {content}
    </span>
  </div>
);

interface CombatParticipantListProps {
  participants: CombatParticipant[];
  currentTurnIndex: number;
  selectedParticipantId: string | null;
  onSelectParticipant: (id: string) => void;
}

/**
 * Displays a list of combat participants with initiative and status indicators
 */
export const CombatParticipantList: React.FC<CombatParticipantListProps> = ({
  participants,
  currentTurnIndex,
  selectedParticipantId,
  onSelectParticipant
}) => {
  return (
    <List className="w-full max-h-[60vh] overflow-auto" data-testid="participant-list">
      {participants.map((participant, index) => {
        const isCurrentTurn = index === currentTurnIndex;
        const isSelected = participant.id === selectedParticipantId;
        const testIdName = participant.character.name.replace(/\s+/g, '-'); // Create a test-id friendly name
        
        return (
          <ListItem
            key={participant.id}
            data-testid={`participant-item-${testIdName}`}
            className={`
              mb-2 rounded-lg transition-all duration-200
              ${isCurrentTurn ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
              ${isSelected ? 'border-2 border-blue-500' : 'border border-gray-200 dark:border-gray-700'}
              ${participant.isDefeated ? 'opacity-50' : ''}
              cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
            `}
            onClick={() => onSelectParticipant(participant.id)}
          >
            <div className="flex items-center w-full">
              {/* Character Avatar */}
              <div className="relative mr-3">
                <Avatar
                  src={participant.character.descriptionAssetName || undefined}
                  alt={participant.character.name}
                  className={`
                    ${participant.isPlayerCharacter ? 'bg-green-100' : 'bg-red-100'}
                    ${participant.isDefeated ? 'grayscale' : ''}
                  `}
                >
                  {!participant.character.descriptionAssetName && participant.character.name.charAt(0)}
                </Avatar>
                <InitiativeBadge
                  content={participant.initiative}
                  color={participant.isPlayerCharacter ? 'primary' : 'error'}
                />
              </div>
              
              {/* Character Info */}
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <Typography variant="subtitle1" className="font-semibold">
                    {participant.character.name}
                    {isCurrentTurn && (
                      <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                        (Current Turn)
                      </span>
                    )}
                  </Typography>
                  
                  {/* Health status */}
                  <Box>
                    <Chip 
                      label={`${participant.currentHp}/${participant.maxHp} HP`}
                      color={
                        participant.isDefeated 
                          ? 'error'
                          : participant.currentHp / participant.maxHp < 0.3
                            ? 'warning'
                            : 'success'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </div>
                
                {/* Additional information */}
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300 truncate">
                  {participant.character.type} • {participant.isPlayerCharacter ? 'Player' : 'NPC'}
                  {participant.isDefeated && <span className="ml-2 text-red-500">Defeated</span>}
                </Typography>
              </div>
            </div>
          </ListItem>
        );
      })}
    </List>
  );
}; 