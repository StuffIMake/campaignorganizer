import React from 'react';
import { CustomLocation } from '../../store';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon,
  ListItemText,
  Collapse,
  Box, 
  IconButton
} from '../ui';
import { PlaceIcon, ExpandMoreIcon, ExpandLessIcon } from '../../assets/icons';

interface LocationSidebarProps {
  locations: CustomLocation[];
  selectedLocation: CustomLocation | null;
  onLocationSelect: (location: CustomLocation) => void;
  getAllTopLevelLocations: () => CustomLocation[];
  getSublocationsByParentId: (parentId: string) => CustomLocation[];
}

const LocationSidebar: React.FC<LocationSidebarProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  getAllTopLevelLocations,
  getSublocationsByParentId
}) => {
  // Recursive function to render location hierarchy
  const renderLocationItem = (location: CustomLocation, depth = 0) => {
    const sublocations = getSublocationsByParentId(location.id);
    const hasSublocations = sublocations.length > 0;
    
    return (
      <React.Fragment key={location.id}>
        <ListItem 
          disablePadding 
          className={`pl-${depth * 2}`}
        >
          <ListItemButton 
            selected={selectedLocation?.id === location.id}
            onClick={() => onLocationSelect(location)}
            className="group"
          >
            <ListItemIcon className="min-w-9">
              <PlaceIcon className="text-primary-600" />
            </ListItemIcon>
            <ListItemText primary={location.name} />
            {hasSublocations && (
              <IconButton size="small">
                {selectedLocation?.id === location.id ? 
                  <ExpandLessIcon /> : 
                  <ExpandMoreIcon />
                }
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>
        
        {hasSublocations && (
          <Collapse in={selectedLocation?.id === location.id}>
            <List disablePadding>
              {sublocations.map((subloc) => renderLocationItem(subloc, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <List className="overflow-y-auto flex-grow">
      {getAllTopLevelLocations().map((location) => renderLocationItem(location))}
    </List>
  );
};

export default LocationSidebar; 