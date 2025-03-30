import React, { useState, useEffect } from 'react';
import { AssetManager } from '../services/assetManager';
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
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width,
        height,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: 1
      }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error || !pdfUrl) {
    return (
      <Paper sx={{ 
        p: 2, 
        width, 
        height: 'auto', 
        bgcolor: 'background.paper',
        border: '1px solid rgba(255, 0, 0, 0.3)',
        color: 'error.main'
      }}>
        <Typography variant="body1">
          {error || 'Could not load PDF'}
        </Typography>
      </Paper>
    );
  }

  // Create a cleaner PDF viewing experience
  return (
    <Box 
      sx={{ 
        width, 
        height, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      {showTopBar && allowDownload && (
        <Box 
          sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'flex-end',
            backgroundColor: 'background.paper',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '80%' }}>
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
      <Box sx={{ flex: 1, position: 'relative' }}>
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