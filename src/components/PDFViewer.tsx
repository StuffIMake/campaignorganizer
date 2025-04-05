import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Paper, Typography, IconButton } from './ui';
import { AssetManager } from '../services/assetManager';
import { getPdfFilename } from '../utils/pdfUtils';

// Icons
const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
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
  showTopBar = true
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load PDF from assets when component mounts
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
        
        // If it's already a URL (http or data), use it directly
        if (assetName.startsWith('http') || assetName.startsWith('data:')) {
          setPdfUrl(assetName);
          setLoading(false);
          return;
        }
        
        // Otherwise get it from the asset manager
        const dataUrl = await AssetManager.getAssetUrl('images', assetName);
        
        if (!dataUrl) {
          const errorMsg = `Could not load PDF: ${assetName}`;
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setLoading(false);
          return;
        }
        
        setPdfUrl(dataUrl);
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

  // Function to download the PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = getPdfFilename(assetName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded" style={{ width, height }}>
        <CircularProgress size={32} />
      </div>
    );
  }

  // Render error state
  if (error || !pdfUrl) {
    return (
      <div className="p-2 border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 rounded" style={{ width, height: 'auto' }}>
        {error || 'Could not load PDF'}
      </div>
    );
  }

  // Render PDF viewer
  return (
    <div className="relative rounded overflow-hidden" style={{ width, height }}>
      {showTopBar && (
        <div className="absolute top-0 right-0 z-10 p-1 m-1 bg-white/90 dark:bg-gray-800/90 rounded-md flex items-center shadow-sm">
          {allowDownload && (
            <button 
              onClick={handleDownload}
              className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={`Download ${getPdfFilename(assetName)}`}
            >
              <DownloadIcon />
            </button>
          )}
        </div>
      )}
      
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full"
      >
        <div className="p-4 flex flex-col items-center justify-center">
          <p className="mb-2">Your browser cannot display the PDF directly.</p>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </object>
    </div>
  );
};

export default PDFViewer; 