import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  IconButton,
  Box
} from '../../../components/ui';
import { CloseIcon } from '../../../assets/icons';
import MarkdownContent from '../../../components/MarkdownContent';
import PDFViewer from '../../../components/PDFViewer';
import { getPdfFilename } from '../../../utils/pdfUtils';

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
        maxWidth="xl"
        fullWidth
        className="pdf-fullscreen-dialog"
      >
        <div className="relative h-full w-full">
          <IconButton 
            onClick={onClose}
            size="small"
            aria-label="close"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <CloseIcon />
          </IconButton>
          
          <div className="h-screen w-full flex items-center justify-center">
            {currentPdfAsset && (
              <PDFViewer 
                assetName={currentPdfAsset} 
                height="95vh" 
                width="95%" 
                allowDownload={true}
                showTopBar={false}
              />
            )}
          </div>
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