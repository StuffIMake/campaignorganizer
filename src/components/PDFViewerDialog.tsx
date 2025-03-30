import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  IconButton, 
  Typography 
} from './ui';
import { CloseIcon } from '../assets/icons';
import PDFViewer from './PDFViewer';

interface PDFViewerDialogProps {
  open: boolean;
  onClose: () => void;
  assetName: string;
}

export const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({ 
  open, 
  onClose, 
  assetName 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="rounded overflow-hidden"
    >
      <DialogTitle className="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-900">
        <Box className="flex justify-between items-center">
          <Typography variant="subtitle1" component="div">
            {assetName}
          </Typography>
          <IconButton 
            onClick={onClose}
            size="small"
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent className="p-0 h-[75vh]">
        {assetName && (
          <PDFViewer 
            assetName={assetName} 
            height="100%" 
            width="100%" 
            allowDownload={true}
            showTopBar={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog; 