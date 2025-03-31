import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '../../../components/ui';
import { Character, Location } from '../../../store';

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => onChange('type', e.target.value)}
                >
                  <MenuItem value="npc">NPC</MenuItem>
                  <MenuItem value="merchant">Merchant</MenuItem>
                  <MenuItem value="enemy">Enemy</MenuItem>
                  <MenuItem value="player">Player</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="HP"
                type="number"
                fullWidth
                value={formData.hp}
                onChange={(e) => onChange('hp', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={formData.locationId}
                  label="Location"
                  onChange={(e) => onChange('locationId', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Description Type</InputLabel>
                <Select
                  value={formData.descriptionType}
                  label="Description Type"
                  onChange={(e) => onChange('descriptionType', e.target.value)}
                >
                  <MenuItem value="markdown">Markdown</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.descriptionType === 'markdown' ? (
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  value={formData.description}
                  onChange={(e) => onChange('description', e.target.value)}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formData.descriptionType === 'image' ? 'Image Asset' : 'PDF Asset'}
                  </InputLabel>
                  <Select
                    value={formData.descriptionAssetName}
                    label={formData.descriptionType === 'image' ? 'Image Asset' : 'PDF Asset'}
                    onChange={(e) => onChange('descriptionAssetName', e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {imageAssets.map((asset) => (
                      <MenuItem key={asset} value={asset}>
                        {asset}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 