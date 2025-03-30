import React, { useState } from 'react';
import { CustomLocation } from '../../store';
import { 
  Box, 
  Tabs, 
  Tab,
  Typography, 
  Chip, 
  IconButton,
  Divider
} from '../ui';
import MarkdownContent from '../MarkdownContent';
import { MusicNoteIcon, PlaceIcon, ArrowBackIcon } from '../../assets/icons';

interface LocationDetailsProps {
  location: CustomLocation;
  locations: CustomLocation[];
  onBack: () => void;
  onLocationSelect: (location: CustomLocation) => void;
  playTrack: (track: string, options: any) => void;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
  location,
  locations,
  onBack,
  onLocationSelect,
  playTrack
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Handler for showing full description
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Get the name of a location by ID
  const getLocationName = (id: string) => {
    return locations.find(loc => loc.id === id)?.name || 'Unknown';
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
      
      <Tabs 
        value={activeTab} 
        onChange={(_, value) => setActiveTab(value)}
        className="border-b border-gray-200 dark:border-gray-700"
      >
        <Tab label="Info" />
        <Tab label="NPCs" />
        <Tab label="Combats" />
      </Tabs>
      
      <Box className="p-4 overflow-y-auto flex-grow">
        {activeTab === 0 && (
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
        )}
        
        {activeTab === 1 && (
          <Typography variant="body2" className="text-gray-500">
            NPC list would appear here (implemented in separate component)
          </Typography>
        )}
        
        {activeTab === 2 && (
          <Typography variant="body2" className="text-gray-500">
            Combat list would appear here (implemented in separate component)
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LocationDetails; 