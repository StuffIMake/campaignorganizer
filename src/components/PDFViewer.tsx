import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress, 
  Paper, 
  Typography, 
  IconButton 
} from './ui';
import { AssetManager } from '../services/assetManager';

// Import the FileDownloadIcon or create a custom one
const FileDownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

interface PDFViewerProps {
  assetName: string;
  width?: string | number;
  height?: string | number;
  onError?: (error: string) => void;
  allowDownload?: boolean;
  showTopBar?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  assetName,
  width = '100%',
  height = '600px',
  onError,
  allowDownload = false,
  showTopBar = false
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdfFromAssets = async () => {
      if (!assetName) {
        const errorMsg = 'No PDF asset name provided';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = await AssetManager.getAssetUrl('images', assetName);
        
        if (!url) {
          const errorMsg = `Could not load PDF: ${assetName}`;
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setLoading(false);
          return;
        }

        setPdfUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        const errorMsg = `Error loading PDF: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setLoading(false);
      }
    };

    loadPdfFromAssets();
  }, [assetName, onError]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = assetName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded" style={{ width, height }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error || !pdfUrl) {
    return (
      <Paper className="p-2 border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400" style={{ width, height: 'auto' }}>
        <Typography variant="body1">
          {error || 'Could not load PDF'}
        </Typography>
      </Paper>
    );
  }

  // Create a cleaner PDF viewing experience
  return (
    <Box 
      className="flex flex-col rounded overflow-hidden shadow-md"
      style={{ width, height }}
    >
      {showTopBar && allowDownload && (
        <Box 
          className="p-1 flex justify-end bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <Box className="flex-1 flex items-center">
            <Typography variant="body2" color="text.secondary" className="max-w-[80%] truncate">
              {assetName}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleDownload}
            aria-label="download"
            title="Download PDF"
          >
            <FileDownloadIcon />
          </IconButton>
        </Box>
      )}
      <Box className="flex-1 relative">
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
          width="100%"
          height="100%"
          style={{ 
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          title={assetName}
        />
      </Box>
    </Box>
  );
};

export default PDFViewer; 