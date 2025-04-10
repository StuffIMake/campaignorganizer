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
import PDFViewer from '../../../components/PDFViewer';

interface AssetViewerDialogProps {
  pdfViewerOpen: boolean;
  markdownDialogOpen: boolean;
  currentPdfAsset: string;
  currentMarkdownContent: string;
  currentMarkdownTitle: string;
  onClose: () => void;
}

export const AssetViewerDialog: React.FC<AssetViewerDialogProps> = ({
  pdfViewerOpen,
  markdownDialogOpen,
  currentPdfAsset,
  currentMarkdownContent,
  currentMarkdownTitle,
  onClose
}) => {
  // Render PDF viewer
  if (pdfViewerOpen) {
    return (
      <Dialog 
        open={pdfViewerOpen} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth={true}
        className="simple-pdf-dialog"
      >
        <IconButton 
          onClick={onClose}
          size="small"
          aria-label="close"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          <CloseIcon />
        </IconButton>
        
        <div style={{ width: '100%', height: '85vh', position: 'relative' }}>
          {currentPdfAsset && (
            <PDFViewer 
              assetName={currentPdfAsset} 
              height="95vh" 
              width="95%" 
              showTopBar={true}
            />
          )}
        </div>
      </Dialog>
    );
  }

  // Render Markdown dialog
  if (markdownDialogOpen) {
    return (
      <Dialog 
        open={markdownDialogOpen} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>{currentMarkdownTitle}</span>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <MarkdownContent content={currentMarkdownContent} />
        </DialogContent>
        <DialogActions>
          <Button onPress={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
}; 