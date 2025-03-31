import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  IconButton
} from '../../../components/ui';
import { CloseIcon } from '../../../assets/icons';
import MarkdownContent from '../../../components/MarkdownContent';

interface LocationDescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  locationName: string;
  description: string;
  descriptionType?: 'markdown' | 'image' | 'pdf';
}

export const LocationDescriptionDialog: React.FC<LocationDescriptionDialogProps> = ({
  open,
  onClose,
  locationName,
  description,
  descriptionType = 'markdown'
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <span>{locationName}</span>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        {descriptionType === 'markdown' ? (
          <MarkdownContent content={description} />
        ) : descriptionType === 'image' ? (
          <img src={description} alt={locationName} className="max-w-full" />
        ) : (
          <div>PDF view not implemented</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 