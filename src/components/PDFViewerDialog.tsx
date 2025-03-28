import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PDFViewer from './PDFViewer';

interface PDFViewerDialogProps {
  assetName: string;
  open: boolean;
  onClose: () => void;
}

const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({ 
  assetName,
  open,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {assetName}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, flex: 1, display: 'flex' }}>
        <Box sx={{ width: '100%', height: '100%' }}>
          {open && (  // Only render PDFViewer when dialog is open to avoid unnecessary loading
            <PDFViewer 
              assetName={assetName} 
              width="100%" 
              height="100%" 
              allowDownload={true}
              showTopBar={false}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog; 