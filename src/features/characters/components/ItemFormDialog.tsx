import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  Grid
} from '../../../components/ui';
import { Item } from '../../../store';

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  item: Item;
  onChange: (field: keyof Item, value: any) => void;
  onSubmit: () => void;
}

export const ItemFormDialog: React.FC<ItemFormDialogProps> = ({
  open,
  onClose,
  title,
  item,
  onChange,
  onSubmit
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-2">
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="name"
                label="Name"
                fullWidth
                required
                value={item.name}
                onChange={(value) => onChange('name', value)}
                aria-label="Item name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                value={item.description}
                onChange={(value) => onChange('description', value)}
                aria-label="Item description"
                InputProps={{
                  inputProps: {
                    style: { minHeight: '80px' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={item.quantity}
                onChange={(value) => onChange('quantity', value)}
                aria-label="Item quantity"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price (optional)"
                type="number"
                fullWidth
                value={item.price === undefined ? '' : item.price}
                onChange={(value) => onChange('price', value === '' ? undefined : value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onPress={onClose}>Cancel</Button>
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