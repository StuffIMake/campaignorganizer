import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarkdownContent from '../../../components/MarkdownContent';
import {
  ArrowBackIcon,
  HelpIcon as InfoIcon,
  PersonIcon as CharactersIcon,
  MapIcon as ConnectedIcon,
  MusicNoteIcon as MusicIcon,
  PlayArrowIcon,
  SportsKabaddiIcon as CombatIcon,
  ExpandMoreIcon as ExpandIcon,
} from '../../../assets/icons';
import { CustomLocation as Location } from '../../../store';
import { Character } from '../../../store';
import { Combat } from '../../../store';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '../../../components/ui';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`location-details-tabpanel-${index}`}
      aria-labelledby={`location-details-tab-${index}`}
      className="h-full overflow-y-auto scrollbar-thin"
      {...other}
    >
      {value === index && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

interface LocationDetailsProps {
  location: Location;
  locations: Location[];
  characters: Character[];
  combats: Combat[];
  onBack: () => void;
  onLocationSelect: (location: Location) => void;
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const navigate = useNavigate();
  
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };
  
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
    return location.connectedLocations
      ?.map((id) => locations.find((loc) => loc.id === id))
      .filter((loc): loc is Location => loc !== undefined) ?? [];
  };
  
  const getCharactersInLocation = () => {
    return characters.filter(char => char.locationId === location.id);
  };
  
  const getCombatsInLocation = () => {
    return combats.filter(combat => combat.locationId === location.id);
  };
  
  const connectedLocations = getConnectedLocations();
  const charactersInLocation = getCharactersInLocation();
  const combatsInLocation = getCombatsInLocation();
  
  const handleStartCombat = (combat: Combat, event: React.MouseEvent) => {
    // Prevent parent button click
    event.stopPropagation();
    
    // Navigate to the combat session with the selected combat ID
    navigate(`/combat-session?id=${combat.id}`);
    console.log('Starting combat session:', combat.name);
  };
  
  const handleViewCombatDetails = (combat: Combat, event: React.MouseEvent) => {
    // Prevent parent button click
    event.stopPropagation();
    
    // Show combat details dialog
    onCombatClick(combat);
    console.log('Viewing combat details:', combat.name);
  };
  
  const handleViewCharacterDetails = (character: Character) => {
    setSelectedCharacter(character);
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center p-3 border-b border-border-DEFAULT/20 bg-background-surface/30">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack} 
            className="p-1 rounded-full hover:bg-background-elevated/30"
            aria-label="Back"
          >
            <ArrowBackIcon className="w-5 h-5" />
          </button>
          <h2 className="font-display font-semibold text-lg truncate">
            {location.name}
          </h2>
        </div>
        <div className="flex space-x-1">
          {location.backgroundMusic && (
            <button 
              onClick={handlePlayBGM} 
              className="p-1.5 rounded-full hover:bg-background-elevated/30 text-primary-light"
              title="Play Background Music"
            >
              <MusicIcon className="w-5 h-5" />
            </button>
          )}
          {location.entrySound && (
            <button 
              onClick={handlePlayEntrySound} 
              className="p-1.5 rounded-full hover:bg-background-elevated/30 text-primary-light"
              title="Play Entry Sound"
            >
              <PlayArrowIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border-DEFAULT/20">
        <button
          className={`flex-1 py-2.5 px-2 text-sm font-medium flex flex-col items-center transition-colors
            ${activeTab === 0 
              ? 'text-primary-light border-b-2 border-primary-DEFAULT' 
              : 'text-text-secondary hover:text-text-primary hover:bg-background-surface/20'
            }`}
          onClick={() => handleTabChange(0)}
        >
          <InfoIcon className="w-5 h-5 mb-1" />
          <span>Info</span>
        </button>
        <button
          className={`flex-1 py-2.5 px-2 text-sm font-medium flex flex-col items-center transition-colors
            ${activeTab === 1 
              ? 'text-primary-light border-b-2 border-primary-DEFAULT' 
              : 'text-text-secondary hover:text-text-primary hover:bg-background-surface/20'
            }`}
          onClick={() => handleTabChange(1)}
        >
          <CharactersIcon className="w-5 h-5 mb-1" />
          <span>Characters</span>
        </button>
        <button
          className={`flex-1 py-2.5 px-2 text-sm font-medium flex flex-col items-center transition-colors
            ${activeTab === 2 
              ? 'text-primary-light border-b-2 border-primary-DEFAULT' 
              : 'text-text-secondary hover:text-text-primary hover:bg-background-surface/20'
            }`}
          onClick={() => handleTabChange(2)}
        >
          <ConnectedIcon className="w-5 h-5 mb-1" />
          <span>Connected</span>
        </button>
        <button
          className={`flex-1 py-2.5 px-2 text-sm font-medium flex flex-col items-center transition-colors
            ${activeTab === 3 
              ? 'text-primary-light border-b-2 border-primary-DEFAULT' 
              : 'text-text-secondary hover:text-text-primary hover:bg-background-surface/20'
            }`}
          onClick={() => handleTabChange(3)}
        >
          <CombatIcon className="w-5 h-5 mb-1" />
          <span>Combats</span>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-grow overflow-hidden">
        <TabPanel value={activeTab} index={0}>
          <div className="space-y-4">
            {/* Description Preview Box */}
            <div 
              className="glass-effect rounded-lg p-4 hover:ring-1 hover:ring-primary-DEFAULT/50 transition-all cursor-pointer"
              onClick={() => setShowFullDescription(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-text-primary">Description</h3>
                <ExpandIcon size={16} className="text-primary-light" />
              </div>
              
              {location.description ? (
                location.descriptionType === 'markdown' ? (
                  <div className="prose prose-sm prose-invert max-w-none max-h-24 overflow-hidden">
                    <MarkdownContent content={location.description} />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap line-clamp-3">{location.description}</p>
                )
              ) : (
                <p className="text-sm text-text-secondary">No description provided.</p>
              )}
            </div>

            {/* Additional Location Info */}
            <div className="glass-effect rounded-lg p-4">
              <h3 className="text-base font-semibold text-text-primary mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                {location.parentLocationId && (
                  <div>
                    <span className="text-text-secondary">Parent Location:</span>{' '}
                    <span className="text-text-primary">
                      {locations.find(loc => loc.id === location.parentLocationId)?.name || 'Unknown'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-text-secondary">Characters:</span>{' '}
                  <span className="text-text-primary">{charactersInLocation.length || 'None'}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Combat Encounters:</span>{' '}
                  <span className="text-text-primary">{combatsInLocation.length || 'None'}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Connected Locations:</span>{' '}
                  <span className="text-text-primary">{connectedLocations.length || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          {charactersInLocation.length > 0 ? (
            <div className="space-y-2">
              {charactersInLocation.map(character => (
                <div 
                  key={character.id}
                  className="glass-effect rounded-lg overflow-hidden hover:ring-1 hover:ring-primary-DEFAULT/50 transition-all cursor-pointer"
                  onClick={() => handleViewCharacterDetails(character)}
                >
                  <div className="w-full text-left p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm">{character.name}</div>
                      <ExpandIcon size={14} className="text-primary-light/70" />
                    </div>
                    <div className="text-xs text-text-secondary mb-2">
                      {character.type || 'Type not specified'}
                    </div>
                    {character.description && (
                      <div className="text-xs line-clamp-2 text-text-secondary/80">
                        {character.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-text-secondary">
                No characters in this location.
              </p>
            </div>
          )}
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          {connectedLocations.length > 0 ? (
            <div className="space-y-1">
              {connectedLocations.map(connectedLoc => (
                <button
                  key={connectedLoc.id}
                  onClick={() => onLocationSelect(connectedLoc)}
                  className="w-full text-left p-2 rounded hover:bg-background-elevated/30 transition-colors"
                >
                  <div className="font-medium text-sm">{connectedLoc.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-text-secondary">
                No connected locations.
              </p>
            </div>
          )}
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          {combatsInLocation.length > 0 ? (
            <div className="space-y-2">
              {combatsInLocation.map(combat => (
                <div 
                  key={combat.id}
                  className="glass-effect rounded-lg overflow-hidden hover:ring-1 hover:ring-primary-DEFAULT/50 transition-all"
                >
                  <div className="p-3">
                    <div className="font-medium text-sm mb-1">{combat.name}</div>
                    <div className="text-xs text-text-secondary mb-2">
                      {combat.difficulty ? `Difficulty: ${combat.difficulty}` : 'Difficulty not set'}
                    </div>
                    {combat.description && (
                      <div className="text-xs line-clamp-2 text-text-secondary/80 mb-3">
                        {combat.description}
                      </div>
                    )}
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={(e) => handleViewCombatDetails(combat, e)}
                        className="text-xs px-3 py-1 bg-background-elevated/30 hover:bg-background-elevated/60 rounded transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => handleStartCombat(combat, e)}
                        className="text-xs px-3 py-1 bg-primary-dark/30 hover:bg-primary-dark/60 text-primary-light rounded transition-colors flex items-center gap-1"
                      >
                        <PlayArrowIcon size={12} />
                        Start Combat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-text-secondary">
                No combat encounters in this location.
              </p>
            </div>
          )}
        </TabPanel>
      </div>
      
      {/* Full Description Dialog */}
      <Dialog 
        open={showFullDescription} 
        onClose={() => setShowFullDescription(false)}
        maxWidth="lg"
      >
        <DialogTitle>{location.name} - Description</DialogTitle>
        <DialogContent>
          {location.description ? (
            location.descriptionType === 'markdown' ? (
              <div className="prose prose-lg prose-invert max-w-none">
                <MarkdownContent content={location.description} />
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{location.description}</p>
            )
          ) : (
            <p className="text-sm text-text-secondary">No description provided.</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onPress={() => setShowFullDescription(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Character Details Dialog */}
      <Dialog 
        open={selectedCharacter !== null} 
        onClose={() => setSelectedCharacter(null)}
        maxWidth="lg"
      >
        {selectedCharacter && (
          <>
            <DialogTitle>{selectedCharacter.name}</DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-1">Type</h3>
                  <p className="text-base">{selectedCharacter.type || 'Type not specified'}</p>
                </div>
                
                {selectedCharacter.description && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Description</h3>
                    <p className="text-base whitespace-pre-wrap">{selectedCharacter.description}</p>
                  </div>
                )}
                
                {selectedCharacter.stats && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Stats</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {Object.entries(selectedCharacter.stats).map(([key, stat]) => (
                        <div key={key} className="glass-effect p-2 rounded">
                          <span className="text-xs text-text-secondary block">{key}</span>
                          <span className="text-base">{typeof stat === 'object' ? `${stat.current}/${stat.max}` : String(stat)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCharacter.inventory && selectedCharacter.inventory.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Inventory</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.inventory.map((item, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-text-secondary"> - {item.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onPress={() => setSelectedCharacter(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

LocationDetails.displayName = 'LocationDetails';

export default LocationDetails; 