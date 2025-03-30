import React, { useState } from 'react';
import { CustomLocation, Character, Combat } from '../../store';
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton,
  Avatar,
  Tooltip,
  Paper
} from '../ui';
import MarkdownContent from '../MarkdownContent';
import { 
  MusicNoteIcon, 
  PlaceIcon, 
  ArrowBackIcon, 
  PersonIcon, 
  SportsKabaddiIcon
} from '../../assets/icons';
// Import videogame and store icons from ui
import {
  PersonIcon as PersonIconUI,
  StoreIcon,
  SportsKabaddiIcon as SportsKabaddiIconUI,
  VideogameAssetIcon
} from '../ui';

interface LocationDetailsProps {
  location: CustomLocation;
  locations: CustomLocation[];
  characters?: Character[];
  combats?: Combat[];
  onBack: () => void;
  onLocationSelect: (location: CustomLocation) => void;
  playTrack: (track: string, options: any) => void;
  onCharacterClick: (character: Character) => void;
  onCombatClick: (combat: Combat) => void;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
  location,
  locations,
  characters = [], // Default to empty array if not provided
  combats = [], // Default to empty array if not provided
  onBack,
  onLocationSelect,
  playTrack,
  onCharacterClick,
  onCombatClick
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Handler for showing full description
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Tab change handler
  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  // Get the name of a location by ID
  const getLocationName = (id: string) => {
    return locations.find(loc => loc.id === id)?.name || 'Unknown';
  };

  // Filter characters that are in this location
  const locationCharacters = characters.filter(char => char.locationId === location.id);
  
  // Filter combats that are in this location
  const locationCombats = combats.filter(combat => combat.locationId === location.id);

  // Get character type icon
  const getCharacterTypeIcon = (type: string) => {
    switch (type) {
      case 'npc':
        return <PersonIconUI />;
      case 'merchant':
        return <StoreIcon />;
      case 'enemy':
        return <SportsKabaddiIconUI />;
      case 'player':
        return <VideogameAssetIcon />;
      default:
        return <PersonIconUI />;
    }
  };

  // Format character type for display
  const formatCharacterType = (type: string) => {
    switch (type) {
      case 'npc': return 'NPC';
      case 'merchant': return 'Merchant';
      case 'enemy': return 'Enemy';
      case 'player': return 'Player';
      default: return type;
    }
  };

  // Get color based on character type
  const getCharacterTypeColor = (type: string) => {
    switch (type) {
      case 'npc': return 'primary';
      case 'merchant': return 'warning';
      case 'enemy': return 'error';
      case 'player': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box className="flex flex-col h-full overflow-hidden">
      <Box className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Box className="flex items-center mb-2">
          <IconButton 
            onClick={onBack}
            size="small"
            className="mr-2"
          >
            <ArrowBackIcon className="text-sm" />
          </IconButton>
          <Typography variant="h6" className="truncate">
            {location.name}
          </Typography>
        </Box>
        
        {location.description && (
          <Box 
            onClick={() => setShowFullDescription(true)}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-2"
          >
            <Box
              className={showFullDescription ? '' : 'line-clamp-4'}
            >
              <MarkdownContent content={location.description} />
            </Box>
            {!showFullDescription && location.description.length > 200 && (
              <Typography 
                variant="caption" 
                className="block mt-1 text-primary-500"
              >
                Click to view full description
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      <Box className="flex-grow flex flex-col overflow-hidden">
        {/* Custom tab implementation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button 
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === 0 ? 'text-primary-400 border-primary-400' : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'}`}
            onClick={() => handleTabChange(0)}
          >
            Info
          </button>
          <button 
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === 1 ? 'text-primary-400 border-primary-400' : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'}`}
            onClick={() => handleTabChange(1)}
          >
            NPCs
          </button>
          <button 
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === 2 ? 'text-primary-400 border-primary-400' : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'}`}
            onClick={() => handleTabChange(2)}
          >
            Combats
          </button>
        </div>
        
        <Box className="overflow-y-auto flex-grow">
          {/* Info tab */}
          <div className={`p-4 ${activeTab === 0 ? 'block' : 'hidden'}`}>
            <Box>
              {location.backgroundMusic && (
                <Box className="mb-4">
                  <Typography variant="subtitle2">Background Music:</Typography>
                  <Chip 
                    icon={<MusicNoteIcon />} 
                    label={location.backgroundMusic}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => {
                      if (location.backgroundMusic) {
                        playTrack(location.backgroundMusic, { 
                          replace: true,
                          locationId: location.id,
                          loop: true
                        });
                      }
                    }}
                  />
                </Box>
              )}
              
              {location.entrySound && (
                <Box className="mb-4">
                  <Typography variant="subtitle2">Entry Sound:</Typography>
                  <Chip 
                    icon={<MusicNoteIcon />} 
                    label={location.entrySound}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    onClick={() => {
                      if (location.entrySound) {
                        playTrack(location.entrySound, { 
                          replace: false,
                          locationId: location.id
                        });
                      }
                    }}
                  />
                </Box>
              )}
              
              {location.connectedLocations && location.connectedLocations.length > 0 && (
                <Box className="mb-4">
                  <Typography variant="subtitle2">Connected Locations:</Typography>
                  <Box className="flex flex-wrap gap-2 mt-1">
                    {location.connectedLocations.map(locId => {
                      const connectedLoc = locations.find(l => l.id === locId);
                      if (!connectedLoc) return null;
                      
                      return (
                        <Chip 
                          key={locId}
                          icon={<PlaceIcon />}
                          label={connectedLoc.name}
                          size="small"
                          color="info"
                          variant="outlined"
                          onClick={() => onLocationSelect(connectedLoc)}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </div>
          
          {/* NPCs tab */}
          <div className={`p-4 ${activeTab === 1 ? 'block' : 'hidden'}`}>
            <Box>
              {locationCharacters.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {locationCharacters.map(character => (
                    <Paper 
                      key={character.id} 
                      className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
                      onClick={() => onCharacterClick(character)}
                      variant="outlined"
                    >
                      <Box className="p-3 flex items-center">
                        <Avatar className={
                          character.type === 'npc' ? 'bg-blue-100 text-blue-500' :
                          character.type === 'merchant' ? 'bg-amber-100 text-amber-500' :
                          character.type === 'enemy' ? 'bg-red-100 text-red-500' :
                          'bg-green-100 text-green-500'
                        }>
                          {getCharacterTypeIcon(character.type)}
                        </Avatar>
                        <Box className="ml-3 flex-grow">
                          <Typography variant="subtitle1" className="font-medium">
                            {character.name}
                          </Typography>
                          <Box className="flex items-center mt-1">
                            <Chip 
                              label={formatCharacterType(character.type)}
                              size="small"
                              color={getCharacterTypeColor(character.type)}
                              variant="soft"
                              className="mr-2"
                            />
                            {character.hp && (
                              <Tooltip title="Health Points">
                                <Chip 
                                  label={`HP: ${character.hp}`} 
                                  size="small" 
                                  color="error" 
                                  variant="soft"
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                        {character.inventory && character.inventory.length > 0 && (
                          <Tooltip title={`${character.inventory.length} items in inventory`}>
                            <Chip 
                              label={character.inventory.length} 
                              size="small"
                              color="warning"
                              className="ml-2"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </div>
              ) : (
                <Box className="text-center text-gray-500 py-8 flex flex-col items-center">
                  <PersonIconUI className="text-gray-400 mb-3 opacity-50" style={{ fontSize: 48 }} />
                  <Typography variant="body2">
                    No NPCs or characters in this location
                  </Typography>
                  <Typography variant="caption" className="mt-1 text-gray-400">
                    Add characters to this location from the Characters page
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
          
          {/* Combats tab */}
          <div className={`p-4 ${activeTab === 2 ? 'block' : 'hidden'}`}>
            <Box>
              {locationCombats.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {locationCombats.map(combat => (
                    <Paper 
                      key={combat.id} 
                      className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
                      onClick={() => onCombatClick(combat)}
                      variant="outlined"
                    >
                      <Box className="p-3">
                        <Box className="flex items-center">
                          <Avatar className="bg-red-100 text-red-500">
                            <SportsKabaddiIconUI />
                          </Avatar>
                          <Box className="ml-3 flex-grow">
                            <Typography variant="subtitle1" className="font-medium">
                              {combat.name}
                            </Typography>
                            <Box className="flex items-center mt-1">
                              <Chip 
                                label={`Difficulty: ${combat.difficulty || 'Normal'}`} 
                                size="small" 
                                color="secondary"
                                variant="soft"
                                className="mr-2"
                              />
                              {combat.playerCharacters && (
                                <Chip 
                                  label={`${combat.playerCharacters.length} players`} 
                                  size="small" 
                                  color="primary" 
                                  variant="soft"
                                />
                              )}
                            </Box>
                          </Box>
                          <Tooltip title="Start Combat Session">
                            <Chip 
                              label="Start" 
                              color="error"
                              size="small"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCombatClick(combat);
                              }}
                            />
                          </Tooltip>
                        </Box>
                        
                        {combat.description && (
                          <Typography variant="body2" className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-1">
                            {combat.description}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </div>
              ) : (
                <Box className="text-center text-gray-500 py-8 flex flex-col items-center">
                  <SportsKabaddiIconUI className="text-gray-400 mb-3 opacity-50" style={{ fontSize: 48 }} />
                  <Typography variant="body2">
                    No combat encounters in this location
                  </Typography>
                  <Typography variant="caption" className="mt-1 text-gray-400">
                    Add combat encounters from the Combats page
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationDetails; 