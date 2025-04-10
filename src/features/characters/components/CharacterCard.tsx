import React from 'react';
import { Character, Item } from '../../../store';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button
} from '../../../components/ui';
import {
  PersonIcon,
  EditIcon,
  DeleteIcon,
  PlaceIcon,
  HelpIcon,
  SportsKabaddiIcon, 
  MapIcon,
  MusicNoteIcon,
  ExpandMoreIcon,
  ExpandLessIcon,
  AddIcon
} from '../../../assets/icons';

// Define Location interface locally if it's not exported
interface Location {
  id: string;
  name: string;
}

interface CharacterCardProps {
  character: Character;
  locations: Location[];
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onViewAsset: (character: Character) => void;
  onAddItem: (characterId: string) => void;
  onEditItem: (characterId: string, itemId: string) => void;
  onDeleteItem: (characterId: string, itemId: string) => void;
  gridView?: boolean;
  isExpanded?: boolean;
  onToggleInventory?: (characterId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  locations,
  onEdit,
  onDelete,
  onViewAsset,
  onAddItem,
  onEditItem,
  onDeleteItem,
  gridView = false,
  isExpanded = false,
  onToggleInventory = () => {}
}) => {
  const hasPortrait = character.portraitImage && character.portraitImage.trim().length > 0;
  const hasDescription = character.description && character.description.trim().length > 0;
  const hasInventory = character.inventory && character.inventory.length > 0;
  const hasLocation = character.locationId && character.locationId.trim().length > 0;
  
  const location = hasLocation
    ? locations.find(loc => loc.id === character.locationId) 
    : null;
  
  const getTypeIcon = () => {
    switch (character.type) {
      case 'merchant': return <MusicNoteIcon />;
      case 'enemy': return <SportsKabaddiIcon />;
      case 'player': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };
  
  const formatCharacterType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Shortened description for preview
  const shortDescription = hasDescription 
    ? character.description.length > 100 
      ? `${character.description.substring(0, 100)}...` 
      : character.description
    : '';

  // Get inventory count safely
  const inventoryCount = character.inventory?.length || 0;

  // Function to determine border color based on character type
  const getBorderColor = () => {
    switch (character.type) {
      case 'player': return 'from-primary-light to-primary-dark';
      case 'npc': return 'from-secondary-light to-secondary-dark';
      case 'merchant': return 'from-accent-light to-accent-dark';
      case 'enemy': return 'from-rose-400 to-rose-600';
      default: return 'from-primary-light to-primary-dark';
    }
  };

  if (gridView) {
    // Grid view card style
    return (
      <Card
        className="relative shadow-lg hover-lift transition-all duration-300 overflow-hidden h-full rounded-xl"
        data-testid={`character-card-${character.id}`}
        style={{
          backgroundImage: hasPortrait ? `url(${character.portraitImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Colorful top border */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getBorderColor()}`}></div>
        
        <div 
          className={`relative h-full flex flex-col ${hasPortrait ? 'text-white' : ''}`}
          style={{ 
            background: hasPortrait 
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,20,0.85) 70%)' 
              : 'none',
          }}
        >
          {hasLocation && location && (
            <div className="absolute top-3 left-3 z-10">
              <Chip
                icon={<PlaceIcon />}
                label={location.name}
                size="small"
                className="glass-effect-strong backdrop-blur-sm text-xs py-1 rounded-full"
              />
            </div>
          )}
          
          <CardContent className="px-5 pt-5 pb-2 flex-grow flex flex-col">
            <div 
              className="flex items-center cursor-pointer mb-2 z-10" 
              data-testid={`character-view-button-${character.id}`}
              onClick={() => onViewAsset(character)}
              style={{ marginTop: hasLocation && location ? '2rem' : '0' }}
            >
              {!hasPortrait && getTypeIcon()}
              <Typography 
                variant="h6" 
                className={`font-display font-semibold line-clamp-1 ${hasPortrait ? 'text-white' : 'text-text-primary'} ml-2`}
              >
                {character.name}
              </Typography>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Chip
                label={formatCharacterType(character.type)}
                size="small"
                className={`text-xs rounded-full ${hasPortrait ? 'bg-black/30 text-white' : 'bg-background-surface/70 text-text-secondary'}`}
              />
              
              <Chip
                label={`HP: ${character.hp}`}
                size="small" 
                color="error"
                className="text-xs rounded-full"
              />
              
              {character.level && (
                <Chip
                  label={`Lvl ${character.level}`}
                  size="small"
                  className={`text-xs rounded-full ${hasPortrait ? 'bg-black/30 text-white' : 'bg-background-surface/70 text-text-secondary'}`}
                />
              )}
            </div>
            
            {hasDescription && (
              <Typography 
                variant="body2" 
                className={`mb-3 line-clamp-2 ${hasPortrait ? 'text-gray-200' : 'text-text-secondary'}`}
              >
                {shortDescription}
              </Typography>
            )}
            
            {/* Show inventory summary */}
            <div className="mt-auto">
              {hasInventory && (
                <div 
                  className={`text-xs font-semibold flex items-center mt-2 ${
                    hasPortrait ? 'text-white/70' : 'text-text-secondary'
                  }`}
                >
                  <Chip 
                    label={inventoryCount.toString()} 
                    size="small"
                    color="primary"
                    className="h-5 min-w-5 rounded-full mr-2"
                  />
                  <span>Items in inventory</span>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardActions className={`flex justify-between px-3 py-2 ${hasPortrait ? 'bg-black/40' : 'bg-background-surface/30'}`}>
            <div>
              <IconButton 
                size="small"
                data-testid="character-view-button"
                onClick={() => onViewAsset(character)}
                className={hasPortrait ? "text-white/70 hover:text-white" : "text-text-secondary hover:text-primary-light"}
              >
                <HelpIcon />
              </IconButton>
            </div>
            
            <div className="flex">
              <IconButton 
                size="small"
                data-testid="character-edit-button"
                onClick={() => onEdit(character)}
                className={hasPortrait ? "text-white/70 hover:text-white" : "text-text-secondary hover:text-secondary-light"}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small"
                data-testid="character-delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(character.id);
                }}
                className={hasPortrait ? "text-white/70 hover:text-red-400" : "text-text-secondary hover:text-error-DEFAULT"}
              >
                <DeleteIcon />
              </IconButton>
              {hasInventory && (
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleInventory(character.id);
                  }}
                  className={hasPortrait ? "text-white hover:text-primary-light" : "text-text-secondary hover:text-primary-light"}
                  data-testid="character-inventory-button"
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </div>
          </CardActions>
        </div>
      </Card>
    );
  }

  // List view style
  return (
    <div className="mb-3" data-testid={`character-item-${character.id}`}>
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
        {/* Colored left border */}
        <div className="relative">
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getBorderColor()}`}></div>
          
          <CardContent className="p-3 pl-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-grow items-center">
                <div 
                  onClick={() => onViewAsset(character)}
                  className="flex items-center cursor-pointer mr-3" 
                >
                  {hasPortrait ? (
                    <div 
                      className="w-10 h-10 rounded-md mr-3 bg-cover bg-center border border-primary/30"
                      style={{ backgroundImage: `url(${character.portraitImage})` }}
                    ></div>
                  ) : (
                    <div className="mr-3 text-xl" style={{ color: `var(--tw-color-${character.type === 'enemy' ? 'error' : 'primary'})` }}>
                      {getTypeIcon()}
                    </div>
                  )}
                  <div>
                    <Typography variant="h6" className="font-display font-semibold">
                      {character.name}
                    </Typography>
                    {hasLocation && location && (
                      <div className="flex items-center text-xs text-text-secondary">
                        <PlaceIcon className="w-3.5 h-3.5 mr-1" />
                        <span>{location.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5 ml-auto">
                  <Chip
                    label={formatCharacterType(character.type)}
                    size="small"
                    className="text-xs rounded-full bg-background-surface/70 text-text-secondary"
                  />
                  
                  <Chip
                    label={`HP: ${character.hp}`}
                    size="small" 
                    color="error"
                    className="text-xs rounded-full"
                  />
                  
                  {character.level && (
                    <Chip
                      label={`Lvl ${character.level}`}
                      size="small"
                      className="text-xs rounded-full bg-background-surface/70 text-text-secondary"
                    />
                  )}
                </div>
              </div>
              
              <div className="flex items-center ml-2">
                <IconButton 
                  size="small"
                  onClick={() => onEdit(character)}
                  className="text-text-secondary hover:text-secondary-light mx-1"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(character.id);
                  }}
                  className="text-text-secondary hover:text-error-DEFAULT mx-1"
                >
                  <DeleteIcon />
                </IconButton>
                {hasInventory && (
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleInventory(character.id);
                    }}
                    className="text-text-secondary hover:text-primary-light ml-1"
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </div>
            </div>
          </CardContent>
        </div>
        
        {/* Inventory Section - Only render if expanded */}
        {isExpanded && hasInventory && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-3">
              <Typography variant="subtitle1" className="font-semibold">
                Inventory ({inventoryCount})
              </Typography>
              <Button
                variant="text"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onPress={() => onAddItem(character.id)}
              >
                Add
              </Button>
            </div>
            
            {character.inventory && character.inventory.length > 0 ? (
              <List className="max-h-60 overflow-y-auto scrollbar-thin">
                {character.inventory.map((item) => (
                  <div key={item.id} className="border-b last:border-b-0 dark:border-slate-700 py-1 px-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-grow">
                        <Typography variant="body2" className="font-medium">{item.name}</Typography>
                        {item.description && (
                          <Typography variant="caption" className="text-slate-500 dark:text-slate-400">{item.description}</Typography>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <IconButton
                          size="small"
                          onClick={() => onEditItem(character.id, item.id)}
                        >
                          <EditIcon className="w-4 h-4" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => onDeleteItem(character.id, item.id)}
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </List>
            ) : (
              <Typography variant="body2" className="text-slate-500 dark:text-slate-400 italic">
                No items in inventory
              </Typography>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}; 