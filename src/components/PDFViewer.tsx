import React, { useState, useEffect } from 'react';
import { CircularProgress } from './ui';
import { AssetManager } from '../services/assetManager';
import { getPdfFilename } from '../utils/pdfUtils';


interface PDFViewerProps {
  assetName: string;
  width?: string | number;
  height?: string | number;
  onError?: (error: string) => void;
  showTopBar?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  assetName,
  width = '100%',
  height = '600px',
  onError,
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


  // Function to get PDF viewer parameters
  const getPdfViewerParams = (): string => {
    let params = '#';
    
    // Hide toolbars
    params += 'toolbar=0&';
    
    // Hide navigation panes/sidebar
    params += 'navpanes=0&scrollbar=0&sidebar=0&';
    
    // Set view mode
    params += 'view=Fit&zoom=page-width&';
    
    // Disable default page mode that might show outlines/thumbs
    params += 'pagemode=none&embedded=true';
    
    return params;
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
    <div className="relative w-full h-full" style={{ width, height }}>
      <iframe
        src={`${pdfUrl}${getPdfViewerParams()}`}
        className="w-full h-full"
        style={{ 
          border: 'none',
          backgroundColor: 'transparent'
        }}
      >
      </iframe>
    </div>
  );
};

export default PDFViewer; 