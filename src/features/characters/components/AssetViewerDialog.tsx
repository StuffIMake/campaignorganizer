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
        fullWidth
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>PDF Viewer</span>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div style={{ height: '70vh' }}>
            <iframe 
              src={currentPdfAsset} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="PDF Viewer"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
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
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
}; 