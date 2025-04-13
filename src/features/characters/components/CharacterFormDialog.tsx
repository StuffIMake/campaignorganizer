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
import MarkdownContent from '../../../components/MarkdownContent';

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
  // Create asset items for select dropdown
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
      <DialogTitle className="border-b border-gray-700 pb-3">{title}</DialogTitle>
      <DialogContent className="p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left panel - core information */}
          <div className="md:w-1/3 p-6 bg-gray-800 border-r border-gray-700">
            <div className="mb-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Name</h3>
              <TextField
                fullWidth
                value={formData.name}
                onChange={(value) => onChange('name', value)}
                isRequired
                className="mb-4"
              />
              
              <FormControl fullWidth className="mb-4">
                <InputLabel>Type</InputLabel>
                <Select
                  selectedKey={formData.type}
                  onSelectionChange={(key) => onChange('type', key)}
                >
                  <SelectItem key="player">Player</SelectItem>
                  <SelectItem key="npc">NPC</SelectItem>
                  <SelectItem key="monster">Monster</SelectItem>
                </Select>
              </FormControl>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">HP</h3>
              <TextField
                fullWidth
                value={String(formData.hp)}
                onChange={(value) => onChange('hp', parseInt(value) || 0)}
              />
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Location</h3>
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
                    placeholder="Select a location" 
                    fullWidth
                  />
                )}
              />
            </div>
          </div>
          
          {/* Right panel - description */}
          <div className="md:w-2/3 p-6">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Description</h3>
            
            <FormControl fullWidth className="mb-4">
              <InputLabel>Content Type</InputLabel>
              <Select
                selectedKey={formData.descriptionType}
                onSelectionChange={(key) => onChange('descriptionType', key)}
              >
                <SelectItem key="markdown">Markdown</SelectItem>
                <SelectItem key="image">Image</SelectItem>
                <SelectItem key="pdf">PDF</SelectItem>
              </Select>
            </FormControl>
            
            {formData.descriptionType === 'markdown' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={formData.description}
                    onChange={(value) => onChange('description', value)}
                    className="h-full"
                  />
                </div>
                
                <div className="border border-gray-700 rounded-md bg-gray-850 p-4 overflow-auto">
                  <h3 className="text-sm font-medium mb-4 text-gray-400 border-b border-gray-700 pb-2">Preview</h3>
                  <div className="prose prose-invert max-w-none">
                    <MarkdownContent content={formData.description || "Preview will appear here"} />
                  </div>
                </div>
              </div>
            ) : (
              <FormControl fullWidth>
                <InputLabel>
                  {formData.descriptionType === 'image' ? 'Image Asset' : 'PDF Asset'}
                </InputLabel>

                <Autocomplete<string | null>
                  options={assetItems.map(item => item.key as string)}
                  getOptionLabel={(option: string | null) => {
                    const item = assetItems.find(i => i.key === option);
                    return item ? String(item.key) : '';
                  }}
                  value={formData.descriptionAssetName || null}
                  onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
                    onChange('descriptionAssetName', selectedOption || '');
                  }}
                  isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
                  renderInput={(params: any) => (
                    <TextField 
                      {...params}
                      placeholder="Select an asset"
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogActions className="border-t border-gray-700 p-4">
        <Button onPress={onClose} variant="outlined">Cancel</Button>
        <Button 
          onPress={handleSubmit} 
          isDisabled={!formData.name}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 