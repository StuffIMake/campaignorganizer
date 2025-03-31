import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Tabs, 
  Tab, 
  Typography 
} from '../../../components/ui';
import MarkdownContent from '../../../components/MarkdownContent';
import { 
  ArrowBackIcon, 
  MusicNoteIcon as MusicIcon, 
  PlayArrowIcon, 
  HelpIcon as InfoIcon, 
  PersonIcon as InventoryIcon, 
  MapIcon as ConnectedIcon 
} from '../../../assets/icons';
import { Location, Character, Combat } from '../../../types';

interface LocationDetailsProps {
  location: Location;
  locations: Location[];
  characters: Character[];
  combats: Combat[];
  onBack: () => void;
  onLocationSelect: (id: string) => void;
  playTrack: (url: string, options?: { replace?: boolean; locationId?: string; loop?: boolean }) => void;
  onCharacterClick: (character: Character) => void;
  onCombatClick: (combat: Combat) => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  location,
  locations,
  characters,
  combats,
  onBack,
  onLocationSelect,
  playTrack,
  onCharacterClick,
  onCombatClick
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  
  const handlePlayBGM = () => {
    if (location.backgroundMusic) {
      playTrack(`audio/${location.backgroundMusic}`, { 
        locationId: location.id,
        loop: true
      });
    }
  };
  
  const handlePlayEntrySound = () => {
    if (location.entrySound) {
      playTrack(`audio/${location.entrySound}`, { 
        locationId: `${location.id}-entry`,
        loop: false
      });
    }
  };
  
  const getConnectedLocations = () => {
    if (!location.connectedLocations || location.connectedLocations.length === 0) {
      return [];
    }
    
    return location.connectedLocations
      .map(id => locations.find(loc => loc.id === id))
      .filter(loc => loc !== undefined) as Location[];
  };
  
  const getCharactersInLocation = () => {
    return characters.filter(char => char.locationId === location.id);
  };
  
  const getCombatsInLocation = () => {
    return combats.filter(combat => combat.locationId === location.id);
  };
  
  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper className="flex flex-col h-full overflow-hidden">
      <Box className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
        <Box display="flex" alignItems="center">
          <IconButton onClick={onBack} size="small" color="default" className="mr-2">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            {location.name}
          </Typography>
        </Box>
        <Box>
          {location.backgroundMusic && (
            <IconButton onClick={handlePlayBGM} size="small" title="Play Background Music">
              <MusicIcon />
            </IconButton>
          )}
          {location.entrySound && (
            <IconButton onClick={handlePlayEntrySound} size="small" title="Play Entry Sound">
              <PlayArrowIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="fullWidth" 
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab icon={<InfoIcon />} label="Info" />
        <Tab icon={<InventoryIcon />} label="Characters" />
        <Tab icon={<ConnectedIcon />} label="Connected" />
      </Tabs>
      
      <Box className="flex-grow overflow-auto p-4">
        {/* Info Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Card variant="outlined" className="mb-4">
              <CardContent>
                {location.descriptionType === 'markdown' ? (
                  <MarkdownContent content={location.description} />
                ) : (
                  <Typography>{location.description}</Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Display combat encounters for this location */}
            {getCombatsInLocation().length > 0 && (
              <Box className="mt-4">
                <Typography variant="subtitle1" gutterBottom>
                  Combat Encounters
                </Typography>
                <List dense>
                  {getCombatsInLocation().map(combat => (
                    <ListItem 
                      key={combat.id} 
                      button 
                      onClick={() => onCombatClick(combat)}
                      className="border mb-2 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <ListItemText 
                        primary={combat.name} 
                        secondary={combat.difficulty ? `Difficulty: ${combat.difficulty}` : undefined}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Display audio information */}
            {(location.backgroundMusic || location.entrySound) && (
              <Box className="mt-4">
                <Typography variant="subtitle1" gutterBottom>
                  Audio
                </Typography>
                <List dense>
                  {location.backgroundMusic && (
                    <ListItem>
                      <ListItemText 
                        primary="Background Music" 
                        secondary={location.backgroundMusic}
                      />
                      <IconButton size="small" onClick={handlePlayBGM}>
                        <PlayArrowIcon />
                      </IconButton>
                    </ListItem>
                  )}
                  {location.entrySound && (
                    <ListItem>
                      <ListItemText 
                        primary="Entry Sound" 
                        secondary={location.entrySound}
                      />
                      <IconButton size="small" onClick={handlePlayEntrySound}>
                        <PlayArrowIcon />
                      </IconButton>
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}
        
        {/* Characters Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Characters in this location
            </Typography>
            {getCharactersInLocation().length > 0 ? (
              <List>
                {getCharactersInLocation().map(character => (
                  <ListItem 
                    key={character.id} 
                    button 
                    onClick={() => onCharacterClick(character)}
                    className="border mb-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ListItemText 
                      primary={character.name} 
                      secondary={character.type}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No characters in this location
              </Typography>
            )}
          </Box>
        )}
        
        {/* Connected Locations Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Connected Locations
            </Typography>
            {getConnectedLocations().length > 0 ? (
              <List>
                {getConnectedLocations().map(connectedLoc => (
                  <ListItem 
                    key={connectedLoc.id} 
                    button 
                    onClick={() => onLocationSelect(connectedLoc.id)}
                    className="border mb-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ListItemText 
                      primary={connectedLoc.name} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No connected locations
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LocationDetails; 