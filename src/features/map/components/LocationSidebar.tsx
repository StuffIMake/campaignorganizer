import React, { useState } from 'react';
import { CustomLocation } from '../../../store';
import { PlaceIcon, ExpandMoreIcon, ExpandLessIcon } from '../../../assets/icons';

interface LocationSidebarProps {
  locations: CustomLocation[];
  selectedLocation: CustomLocation | null;
  onLocationSelect: (location: CustomLocation) => void;
  getAllTopLevelLocations: () => CustomLocation[];
  getSublocationsByParentId: (parentId: string) => CustomLocation[];
}

export const LocationSidebar: React.FC<LocationSidebarProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  getAllTopLevelLocations,
  getSublocationsByParentId
}) => {
  // Track expanded locations separately from selected location
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});

  // Handle expand/collapse toggle
  const handleToggleExpand = (locationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the list item click
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };
  
  const renderLocationItem = (location: CustomLocation, depth = 0) => {
    const sublocations = getSublocationsByParentId(location.id);
    const hasSublocations = sublocations.length > 0;
    const isSelected = selectedLocation?.id === location.id;
    const isExpanded = expandedLocations[location.id] || isSelected;

    return (
      <React.Fragment key={location.id}>
        <div 
          className={`
            flex items-center px-2 py-1.5 cursor-pointer relative transition-all
            ${isSelected ? 'bg-primary-dark/20 text-primary-light' : 'hover:bg-background-surface/40'}
            ${depth > 0 ? 'pl-' + (depth * 4 + 2) : ''}
          `}
          onClick={() => onLocationSelect(location)}
        >
          <div className="flex items-center flex-grow min-h-[36px]">
            <PlaceIcon className={`w-5 h-5 mr-2 ${isSelected ? 'text-primary-light' : 'text-primary-DEFAULT'}`} />
            <span className="truncate font-medium">{location.name}</span>
          </div>
          
          {hasSublocations && (
            <button 
              className="p-1 rounded-full hover:bg-background-elevated/30 text-text-secondary"
              onClick={(e) => handleToggleExpand(location.id, e)}
            >
              {isExpanded ? 
                <ExpandLessIcon className="w-5 h-5" /> : 
                <ExpandMoreIcon className="w-5 h-5" />
              }
            </button>
          )}
        </div>

        {hasSublocations && isExpanded && (
          <div className="pl-2">
            {sublocations.map((subloc) => renderLocationItem(subloc, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="overflow-y-auto scrollbar-thin flex-grow">
      {getAllTopLevelLocations().map((location) => renderLocationItem(location))}
    </div>
  );
}; 