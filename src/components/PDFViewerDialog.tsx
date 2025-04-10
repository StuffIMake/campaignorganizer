import React from 'react';
import { 
  Dialog, 
  IconButton
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
      maxWidth="xl"
      fullWidth
      className="pdf-fullscreen-dialog"
    >
      <div className="relative h-full w-full bg-transparent">
        <IconButton 
          onClick={onClose}
          size="small"
          aria-label="close"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          <CloseIcon />
        </IconButton>
        
        <div className="h-screen w-full flex items-center justify-center">
          {assetName && (
            <PDFViewer 
              assetName={assetName} 
              height="95vh" 
              width="95%" 
              showTopBar={false}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default PDFViewerDialog; 