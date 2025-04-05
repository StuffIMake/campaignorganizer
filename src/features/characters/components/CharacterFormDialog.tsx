import React, { useMemo } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  Select,
  Item as SelectItem,
  FormControl,
  InputLabel,
  Grid,
  Autocomplete
} from '../../../components/ui';
import { Character } from '../../../store';
import type { CustomLocation as Location } from '../../../store';

interface CharacterFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formData: {
    name: string;
    description: string;
    type: 'npc' | 'merchant' | 'enemy' | 'player';
    locationId: string;
    descriptionType: 'markdown' | 'image' | 'pdf';
    descriptionAssetName: string;
    hp: number | string;
  };
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  locations: Location[];
  imageAssets: string[];
}

export const CharacterFormDialog: React.FC<CharacterFormDialogProps> = ({
  open,
  onClose,
  title,
  formData,
  onChange,
  onSubmit,
  locations,
  imageAssets
}) => {
  // Create a collection of items for React Aria Select
  // This approach uses React Aria's item collection pattern
  const locationItems = useMemo(() => {
    // Start with the "None" option
    const items = [
      <SelectItem key="">None</SelectItem>
    ];
    
    // Add each location
    for (const location of locations) {
      items.push(
        <SelectItem key={location.id}>{location.name}</SelectItem>
      );
    }
    
    return items;
  }, [locations]);
  
  // Similarly create asset items
  const assetItems = useMemo(() => {
    const items = [
      <SelectItem key="">None</SelectItem>
    ];
    
    for (const asset of imageAssets) {
      items.push(
        <SelectItem key={asset}>{asset}</SelectItem>
      );
    }
    
    return items;
  }, [imageAssets]);

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-2">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(value) => onChange('name', value)}
                isRequired
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  selectedKey={formData.type}
                  label="Type"
                  onSelectionChange={(key) => onChange('type', key)}
                >
                  <SelectItem key="player">Player</SelectItem>
                  <SelectItem key="npc">NPC</SelectItem>
                  <SelectItem key="monster">Monster</SelectItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="HP"
                value={String(formData.hp)}
                onChange={(value) => onChange('hp', parseInt(value) || 0)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Autocomplete<Location | null>
                options={locations}
                getOptionLabel={(option: Location | null) => option?.name || ''}
                value={locations.find(loc => loc.id === formData.locationId) || null}
                onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: Location | null) => {
                  onChange('locationId', selectedOption?.id || '');
                }}
                isOptionEqualToValue={(option: Location | null, value: Location | null) => option?.id === value?.id}
                renderInput={(params: any) => (
                  <TextField 
                    {...params}
                    label="Location"
                    placeholder="Select a location" 
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Description Type</InputLabel>
                <Select
                  selectedKey={formData.descriptionType}
                  label="Description Type"
                  onSelectionChange={(key) => onChange('descriptionType', key)}
                >
                  <SelectItem key="markdown">Markdown</SelectItem>
                  <SelectItem key="image">Image</SelectItem>
                  <SelectItem key="pdf">PDF</SelectItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.descriptionType === 'markdown' ? (
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  value={formData.description}
                  onChange={(value) => onChange('description', value)}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formData.descriptionType === 'image' ? 'Image Asset' : 'PDF Asset'}
                  </InputLabel>
                  <Select
                    selectedKey={formData.descriptionAssetName}
                    label={formData.descriptionType === 'image' ? 'Image Asset' : 'PDF Asset'}
                    onSelectionChange={(key) => onChange('descriptionAssetName', key)}
                  >
                    {assetItems}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onPress={onClose}>Cancel</Button>
          <Button 
            onPress={handleSubmit} 
            isDisabled={!formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 