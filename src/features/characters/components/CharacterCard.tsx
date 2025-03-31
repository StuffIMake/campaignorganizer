import React from 'react';
import { Character, Item, Location } from '../../../store';
import {
  Card,
  CardContent,
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
  StoreIcon, 
  SportsKabaddiIcon,
  VideogameAssetIcon,
  PlaceIcon,
  InventoryIcon,
  EditIcon,
  DeleteIcon
} from '../../../components/ui';

interface CharacterCardProps {
  character: Character;
  locations: Location[];
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onViewAsset: (character: Character) => void;
  onAddItem: (characterId: string) => void;
  onEditItem: (characterId: string, itemId: string) => void;
  onDeleteItem: (characterId: string, itemId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  locations,
  onEdit,
  onDelete,
  onViewAsset,
  onAddItem,
  onEditItem,
  onDeleteItem
}) => {
  const getTypeIcon = () => {
    switch (character.type) {
      case 'merchant': return <StoreIcon />;
      case 'enemy': return <SportsKabaddiIcon />;
      case 'player': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };
  
  const formatCharacterType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const location = character.locationId 
    ? locations.find(loc => loc.id === character.locationId) 
    : null;
  
  return (
    <Card className="mb-4">
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            {getTypeIcon()}
            <Typography variant="h5" className="ml-2">
              {character.name}
            </Typography>
          </div>
          <div>
            <IconButton onClick={() => onEdit(character)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(character.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
        
        <div className="flex items-center mb-2">
          <Chip label={formatCharacterType(character.type)} className="mr-2" />
          <Chip label={`HP: ${character.hp}`} color="error" />
          {location && (
            <Chip 
              icon={<PlaceIcon />} 
              label={location.name}
              className="ml-2"
            />
          )}
        </div>
        
        {/* Description section */}
        <div 
          className="mb-4 mt-4 p-3 bg-gray-100 rounded cursor-pointer"
          onClick={() => onViewAsset(character)}
        >
          {character.descriptionType === 'markdown' ? (
            <>
              <Typography variant="subtitle1" className="mb-1">Description:</Typography>
              <Typography variant="body2" className="whitespace-pre-wrap">
                {character.description.length > 150 
                  ? `${character.description.substring(0, 150)}...` 
                  : character.description}
              </Typography>
              {character.description.length > 150 && (
                <Typography variant="body2" color="primary" className="mt-1">
                  Click to view full description
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" className="text-center py-2">
              Click to view {character.descriptionType === 'image' ? 'image' : 'PDF'} description
            </Typography>
          )}
        </div>
        
        {/* Inventory section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Typography variant="h6" className="flex items-center">
              <InventoryIcon className="mr-1" /> Inventory
            </Typography>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => onAddItem(character.id)}
            >
              Add Item
            </Button>
          </div>
          
          <Divider className="mb-2" />
          
          {character.inventory && character.inventory.length > 0 ? (
            <List dense>
              {character.inventory.map((item: Item) => (
                <ListItem 
                  key={item.id}
                  secondaryAction={
                    <div>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => onEditItem(character.id, item.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => onDeleteItem(character.id, item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  }
                >
                  <ListItemText
                    primary={
                      <div className="flex items-center justify-between max-w-[85%]">
                        <span>{item.name}</span>
                        <div>
                          <Chip 
                            label={`Qty: ${item.quantity}`} 
                            size="small" 
                            className="mr-1"
                          />
                          {item.price !== undefined && (
                            <Chip 
                              label={`Price: ${item.price}`} 
                              size="small" 
                              color="primary"
                            />
                          )}
                        </div>
                      </div>
                    }
                    secondary={item.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" className="text-gray-500 text-center py-2">
              No items in inventory
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 