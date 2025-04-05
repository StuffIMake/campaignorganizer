import React from 'react';
import { CustomLocation } from '../../../store';
import { 
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Chip,
  ListItem,
} from '../../../components/ui';
import {
  ExpandMoreIcon, 
  ExpandLessIcon,
  EditIcon,
  DeleteIcon,
  PlaceIcon,
  MusicNoteIcon,
  HelpIcon,
} from '../../../assets/icons';

interface LocationItemProps {
  location: CustomLocation;
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpand: (locationId: string) => void;
  onEdit: (location: CustomLocation) => void;
  onDelete: (locationId: string) => void;
  onViewDescription: (locationId: string) => void;
  gridView?: boolean;
  parentLocation?: CustomLocation | null;
}

export const LocationItem: React.FC<LocationItemProps> = ({
  location,
  level,
  isExpanded,
  hasChildren,
  onToggleExpand,
  onEdit,
  onDelete,
  onViewDescription,
  gridView = false,
  parentLocation = null
}) => {
  const testIdName = location.name.replace(/\s+/g, '-'); // Create a test-id friendly name
  const hasDescription = location.description && location.description.trim().length > 0;
  const hasImage = location.imageUrl && location.imageUrl?.trim().length > 0;
  const hasBackgroundMusic = location.backgroundMusic && location.backgroundMusic?.trim().length > 0;
  const hasEntrySound = location.entrySound && location.entrySound?.trim().length > 0;
  const hasParent = !!parentLocation;
  
  // Extract file names for display
  const bgMusicName = hasBackgroundMusic && location.backgroundMusic ? location.backgroundMusic.split('/').pop() : '';
  const entrySoundName = hasEntrySound && location.entrySound ? location.entrySound.split('/').pop() : '';
  const imageName = hasImage && location.imageUrl ? location.imageUrl.split('/').pop() : '';

  // Shortened description for preview
  const shortDescription = hasDescription 
    ? location.description.length > 100 
      ? `${location.description.substring(0, 100)}...` 
      : location.description
    : '';

  // Handle sub-location display in tree view
  const sublocations = getFilteredSublocationsByParentId ? 
    getFilteredSublocationsByParentId(location.id) : [];

  // Function to determine border color based on location level or properties
  const getBorderColor = () => {
    // Level-based coloring, but could be replaced with type-based or other logic
    const colors = [
      'from-primary-light to-primary-dark',      // Level 0
      'from-secondary-light to-secondary-dark',  // Level 1
      'from-accent-light to-accent-dark',        // Level 2
      'from-teal-400 to-teal-600',               // Level 3
      'from-amber-400 to-amber-600',             // Level 4
      'from-rose-400 to-rose-600',               // Level 5+
    ];
    
    return colors[Math.min(level, colors.length - 1)];
  };

  if (gridView) {
    // Grid view card style
    return (
      <Card
        className="relative shadow-lg hover-lift transition-all duration-300 overflow-hidden h-full rounded-xl"
        data-testid={`location-item-${testIdName}`}
        style={{
          backgroundImage: hasImage && location.imageUrl ? `url(${location.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Colorful top border */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getBorderColor()}`}></div>
        
        <div 
          className={`relative h-full flex flex-col ${hasImage ? 'text-white' : ''}`}
          style={{ 
            background: hasImage 
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,20,0.85) 70%)' 
              : 'none',
          }}
        >
          
          <CardContent className="px-5 pt-5 pb-2 flex-grow flex flex-col">
            <div 
              className="flex items-center cursor-pointer mb-2 z-10" 
              data-testid={`location-item-view-button-${testIdName}`}
              onClick={() => onViewDescription(location.id)}
            >
              {!hasImage && <PlaceIcon className="mr-2 text-primary" />}
              <Typography 
                variant="h6" 
                className={`font-display font-semibold line-clamp-1 ${hasImage ? 'text-white' : 'text-text-primary'}`}
              >
                {location.name}
              </Typography>
            </div>
            
            {hasDescription && (
              <Typography 
                variant="body2" 
                className={`mb-3 line-clamp-2 ${hasImage ? 'text-gray-200' : 'text-text-secondary'}`}
              >
                {shortDescription}
              </Typography>
            )}
            
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {hasBackgroundMusic && (
                <Chip
                  icon={<MusicNoteIcon />}
                  label={bgMusicName}
                  size="small"
                  className={`text-xs rounded-full ${hasImage ? 'bg-black/30 text-white' : 'bg-background-surface/50 text-text-secondary'}`}
                />
              )}
              
              {hasEntrySound && (
                <Chip
                  icon={<MusicNoteIcon />}
                  label={entrySoundName}
                  size="small"
                  className={`text-xs rounded-full ${hasImage ? 'bg-black/30 text-white' : 'bg-background-surface/50 text-text-secondary'}`}
                />
              )}
            </div>
          </CardContent>
          
          <CardActions className={`flex justify-between px-3 py-2 ${hasImage ? 'bg-black/40' : 'bg-background-surface/30'}`}>
            <div>
              <IconButton 
                size="small"
                data-testid="location-item-view-button"
                onClick={() => onViewDescription(location.id)}
                className={hasImage ? "text-white/70 hover:text-white" : "text-text-secondary hover:text-primary-light"}
              >
                <HelpIcon />
              </IconButton>
            </div>
            
            <div className="flex">
              <IconButton 
                size="small"
                data-testid="location-item-edit-button"
                onClick={() => onEdit(location)}
                className={hasImage ? "text-white/70 hover:text-white" : "text-text-secondary hover:text-secondary-light"}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small"
                data-testid="location-item-delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(location.id);
                }}
                className={hasImage ? "text-white/70 hover:text-red-400" : "text-text-secondary hover:text-error-DEFAULT"}
              >
                <DeleteIcon />
              </IconButton>
              {hasChildren && (
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(location.id);
                  }}
                  className={hasImage ? "text-white hover:text-primary-light" : "text-text-secondary hover:text-primary-light"}
                  data-testid="location-item-expand-button"
                >
                  <ExpandMoreIcon />
                </IconButton>
              )}
            </div>
          </CardActions>
        </div>
      </Card>
    );
  }

  // List view (tree)
  return (
    <ListItem 
      key={location.id}
      data-testid={`location-item-${testIdName}`}
      disablePadding
      className="mb-3 flex flex-col items-stretch"
      style={{ 
        marginLeft: `${level * 16}px`, 
      }}
    >
      <Card
        className="w-full shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden"
        style={{ 
          position: 'relative',
        }}
      >
        {/* Colored left border */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getBorderColor()}`}
        ></div>
        
        <CardContent className="p-3 pl-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-grow items-center">
              <div 
                data-testid={`location-item-view-button-${testIdName}`}
                className="flex items-center cursor-pointer mr-3" 
                onClick={() => onViewDescription(location.id)}
              >
                {hasImage ? (
                  <div 
                    className="w-10 h-10 rounded-md mr-3 bg-cover bg-center border border-primary/30"
                    style={{ backgroundImage: `url(${location.imageUrl})` }}
                  ></div>
                ) : (
                  <PlaceIcon className="mr-3 text-primary text-xl" />
                )}
                <Typography variant="h6" className="font-display font-semibold">
                  {location.name}
                </Typography>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {!hasImage && (
                  <Chip
                    icon={<PlaceIcon />}
                    label="No image"
                    size="small"
                    className="text-xs rounded-full bg-background-surface/70 text-text-secondary"
                  />
                )}
                
                {hasBackgroundMusic && (
                  <Chip
                    icon={<MusicNoteIcon />}
                    label="Music"
                    size="small"
                    className="text-xs rounded-full bg-background-surface/70 text-text-secondary"
                  />
                )}
                
                {hasChildren && sublocations.length > 0 && (
                  <Chip
                    label={`${sublocations.length}`}
                    size="small"
                    className="text-xs rounded-full bg-primary-dark/20 text-primary-light"
                  />
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <IconButton 
                size="small"
                data-testid="location-item-edit-button"
                onClick={() => onEdit(location)}
                className="text-text-secondary hover:text-secondary-light mx-1"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small"
                data-testid="location-item-delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(location.id);
                }}
                className="text-text-secondary hover:text-error-DEFAULT mx-1"
              >
                <DeleteIcon />
              </IconButton>
              {hasChildren && (
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(location.id);
                  }}
                  className="text-text-secondary hover:text-primary-light ml-1"
                  data-testid="location-item-expand-button"
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ListItem>
  );
};

// Placeholder function for the component to compile - will be overridden by props
const getFilteredSublocationsByParentId = (parentId: string) => []; 