import React from 'react';
import { CustomLocation } from '../../../store';
import { 
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Chip
} from '../../../components/ui';
import {
  ExpandMoreIcon, 
  ExpandLessIcon,
  EditIcon,
  DeleteIcon,
  PlaceIcon,
  MusicNoteIcon
} from '../../../assets/icons';

interface LocationItemProps {
  location: CustomLocation;
  level: number;
  isExpanded: boolean;
  onToggleExpand: (locationId: string) => void;
  onEdit: (location: CustomLocation) => void;
  onDelete: (locationId: string) => void;
  onViewDescription: (locationId: string) => void;
  childLocations?: React.ReactNode;
}

export const LocationItem: React.FC<LocationItemProps> = ({
  location,
  level,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onViewDescription,
  childLocations
}) => {
  return (
    <div className="mb-2">
      <Card
        style={{
          marginLeft: `${level * 20}px`,
          borderLeft: level > 0 ? '3px solid #6366F1' : 'none',
        }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => onViewDescription(location.id)}
            >
              <PlaceIcon className="mr-2 text-indigo-500" />
              <Typography variant="h6">{location.name}</Typography>
            </div>
            
            <div className="flex items-center">
              {location.backgroundMusic && (
                <Chip
                  icon={<MusicNoteIcon />}
                  label={location.backgroundMusic.split('/').pop()}
                  size="small"
                  className="mr-2"
                />
              )}
              <IconButton onClick={() => onEdit(location)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(location.id)}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={() => onToggleExpand(location.id)}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isExpanded && childLocations}
    </div>
  );
}; 