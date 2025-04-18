import React, { useState, useEffect } from 'react';
import { AssetManager } from '../services/assetManager';
import PDFViewer from './PDFViewer';
import { Box, CircularProgress } from './ui';

interface AssetViewerProps {
  assetName: string;
  assetType?: 'image' | 'pdf';  // Optional - will auto-detect from extension if not provided
  width?: string | number;
  height?: string | number;
  maxHeight?: string | number;
  fit?: 'contain' | 'cover' | 'fill';
}

const AssetViewer: React.FC<AssetViewerProps> = ({ 
  assetName,
  assetType,
  width = '100%',
  height = 'auto',
  maxHeight,
  fit = 'contain'
}) => {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<'image' | 'pdf' | null>(null);

  useEffect(() => {
    const detectType = () => {
      if (assetType) {
        setDetectedType(assetType);
        return;
      }

      if (assetName.toLowerCase().endsWith('.pdf')) {
        setDetectedType('pdf');
      } else {
        setDetectedType('image');
      }
    };

    const loadAssetFromAssets = async () => {
      if (!assetName) {
        setError('No asset name provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        detectType();
        const url = await AssetManager.getAssetUrl('images', assetName);
        
        if (!url) {
          setError(`Could not load asset: ${assetName}`);
          setLoading(false);
          return;
        }

        setAssetUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error loading asset:', err);
        setError(`Error loading asset: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    loadAssetFromAssets();
  }, [assetName, assetType]);

  if (loading) {
    return (
      <Box 
        className="flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded" 
        style={{ 
          width, 
          height: height || '200px'
        }}
      >
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error || !assetUrl || !detectedType) {
    return (
      <Box 
        className="p-2 text-gray-500 text-sm" 
        style={{ width, height: 'auto' }}
      >
        {error || `Could not load asset: ${assetName}`}
      </Box>
    );
  }

  if (detectedType === 'pdf') {
    return <PDFViewer assetName={assetName} width={width} height={height} showTopBar={false} />;
  }

  // For images
  return (
    <img
      src={assetUrl}
      alt={assetName}
      className="block rounded"
      style={{
        width,
        height,
        maxHeight,
        objectFit: fit
      }}
      onError={() => setError(`Failed to load image: ${assetName}`)}
    />
  );
};

export default AssetViewer; 