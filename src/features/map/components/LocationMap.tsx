import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CustomLocation } from '../../../store';
import { Box, Tooltip, IconButton, Typography, CircularProgress } from '../../../components/ui';
import { PlaceIcon, NorthIcon, ImageNotSupportedIcon } from '../../../assets/icons';
import { AssetManager } from '../../../services/assetManager';

interface LocationMapProps {
  selectedLocation: CustomLocation | null;
  onLocationSelect: (location: CustomLocation) => void;
  getSublocationsByParentId: (parentId: string) => CustomLocation[];
  locations: CustomLocation[];
  editMode?: boolean;
  onMapClick?: (e: React.MouseEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onViewPdf?: (url: string) => void;
  mapContainerRef?: React.RefObject<HTMLDivElement>;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  selectedLocation,
  onLocationSelect,
  getSublocationsByParentId,
  locations,
  editMode = false,
  onMapClick,
  onDrop,
  onDragOver,
  onViewPdf,
  mapContainerRef: externalMapContainerRef
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [imageNaturalWidth, setImageNaturalWidth] = useState(0);
  const [imageNaturalHeight, setImageNaturalHeight] = useState(0);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const internalMapContainerRef = useRef<HTMLDivElement>(null);
  
  // Use the external ref if provided, otherwise use internal ref
  const mapContainerRef = externalMapContainerRef || internalMapContainerRef;
  
  const transformComponentRef = useRef<any>(null);

  // Load image when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      const loadImage = async () => {
        setIsImageLoading(true);
        try {
          // Use the location's imageUrl property if available
          if (selectedLocation.imageUrl) {
            const isPdfFile = selectedLocation.imageUrl.toLowerCase().endsWith('.pdf');
            setIsPdf(isPdfFile);
            
            if (isPdfFile) {
              setImageUrl(''); // Clear image URL since we'll use PDFViewer
            } else {
              
              // Try to get the image URL (prioritizes IndexedDB blob, falls back to public static path)
              const retrievedUrl = await AssetManager.getAssetUrl('images', selectedLocation.imageUrl);

              // Use the retrieved URL if available (could be blob: or /images/...).
              // Only construct a fallback path if AssetManager explicitly returned null (not found/error).
              let finalUrl = retrievedUrl;
              if (retrievedUrl === null && selectedLocation.imageUrl) {
                // Last resort fallback if AssetManager failed completely
                finalUrl = `/images/${selectedLocation.imageUrl}`;
              }
              
              // Set the image URL
              setImageUrl(finalUrl || ''); // Use finalUrl or empty string if still null
            }
          } else {
            // Clear the image URL if no image is selected
            setImageUrl('');
            setIsPdf(false);
          }
        } catch (error) {
          setImageUrl('');
          setIsPdf(false);
        } finally {
          setIsImageLoading(false);
        }
      };
      loadImage();
    } else {
    }
  }, [selectedLocation?.id, selectedLocation?.imageUrl]);

  // Reset transform when entering edit mode
  useEffect(() => {
    if (editMode && transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  }, [editMode]);

  // Add debugging useEffect for selected location without image
  useEffect(() => {
    if (selectedLocation && (!imageUrl && !isPdf)) {
    }
  }, [selectedLocation, imageUrl, isPdf]);

  // Handler for drag start on a location marker
  const handleDragStart = (locationId: string, e: React.DragEvent) => {
    if (!editMode) return;
    
    // Set a transparent drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    
    // Set data for the drag operation - use the original key name
    e.dataTransfer.setData('locationId', locationId);
  };

  // Type guard to check if coordinates are in the expected format
  const isValidCoordinates = (coords: any): coords is [number, number] => {
    return Array.isArray(coords) && coords.length === 2 && 
           typeof coords[0] === 'number' && typeof coords[1] === 'number';
  };

  // Calculate angle between two locations for direction arrows
  const calculateAngle = (loc1: [number, number], loc2: [number, number]) => {
    const dx = loc2[0] - loc1[0];
    const dy = loc2[1] - loc1[1];
    return Math.atan2(dy, dx) * (180 / Math.PI) + 90; // Add 90 to match icon orientation
  };

  // Render direction arrows to connected locations
  const renderDirectionalArrows = () => {
    if (!selectedLocation || !selectedLocation.connectedLocations) return null;

    const circleRadius = 0.06; // Size of the circle around the map center for arrows

    return locations
      .filter(loc => 
        selectedLocation.connectedLocations?.includes(loc.id) &&
        loc.id !== selectedLocation.id &&
        isValidCoordinates(loc.coordinates) && isValidCoordinates(selectedLocation.coordinates) // Only if both have coordinates
      )
      .map(connectedLoc => {
        if (!selectedLocation.coordinates || !connectedLoc.coordinates || 
            !isValidCoordinates(selectedLocation.coordinates) || !isValidCoordinates(connectedLoc.coordinates)) 
          return null;

        // Calculate angle for rotation
        const angleDeg = calculateAngle(
          selectedLocation.coordinates as [number, number], 
          connectedLoc.coordinates as [number, number]
        );

        // Position on circle edge
        const mapCenterX = 0.5;
        const mapCenterY = 0.5;
        const arrowX = mapCenterX + Math.cos((angleDeg - 90) * Math.PI / 180) * circleRadius;
        const arrowY = mapCenterY + Math.sin((angleDeg - 90) * Math.PI / 180) * circleRadius;

        return (
          <Tooltip 
            key={`tooltip-${connectedLoc.id}`}
            title={connectedLoc.name}
            placement="top"
            arrow
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onLocationSelect(connectedLoc);
              }}
              className="absolute z-30 bg-black/50 hover:bg-black/80 text-white"
              style={{
                left: `${arrowX * 100}%`,
                top: `${arrowY * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <NorthIcon 
                className={`transform rotate-[${angleDeg}deg]`}
              />
            </IconButton>
          </Tooltip>
        );
      });
  };

  // Render location markers on the map
  const renderLocationMarkers = () => {
    if (!selectedLocation) return null;

    const sublocations = getSublocationsByParentId(selectedLocation.id);

    return sublocations.map((sublocation) => {
      if (!sublocation.coordinates || !isValidCoordinates(sublocation.coordinates)) return null;

      const [relX, relY] = sublocation.coordinates as [number, number];
      const isSelected = selectedLocation?.id === sublocation.id;

      return (
        <Tooltip 
          key={sublocation.id} 
          title={editMode ? "Drag to move, click to edit" : sublocation.name}
          arrow
          placement="top"
        >
          <Box
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform duration-200"
            style={{
              left: `${relX * 100}%`,
              top: `${relY * 100}%`,
              cursor: editMode ? 'move' : 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onLocationSelect(sublocation);
            }}
            draggable={editMode}
            onDragStart={(e) => handleDragStart(sublocation.id, e)}
          >
            <PlaceIcon 
              className={`
                ${isSelected ? 'text-primary-500' : editMode ? 'text-secondary-500' : 'text-red-500'} 
                ${isSelected ? 'text-4xl' : 'text-3xl'}
                drop-shadow-lg
              `}
            />
            <Typography
              variant="caption"
              className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap
                        bg-black/70 text-white px-1.5 py-0.5 rounded text-xs font-bold text-center
                        max-w-32 overflow-hidden text-ellipsis drop-shadow"
            >
              {sublocation.name}
            </Typography>
          </Box>
        </Tooltip>
      );
    });
  };

  // Render the PDF message if location has a PDF instead of an image
  const renderPdfMessage = () => (
    <Box className="flex flex-col items-center justify-center h-full">
      <Typography variant="body1" className="mb-4">
        This location has a PDF document attached.
      </Typography>
      <IconButton
        className="bg-primary-500 hover:bg-primary-600 text-white"
        onClick={() => {
          if (onViewPdf && selectedLocation?.imageUrl) {
            // Get a blob URL first to avoid navigation issues
            AssetManager.getAssetUrl('images', selectedLocation.imageUrl)
              .then(blobUrl => {
                if (blobUrl) {
                  onViewPdf(blobUrl);
                } else if (selectedLocation.imageUrl) {
                  // Fallback to the direct asset call but with safety
                  onViewPdf(selectedLocation.imageUrl);
                }
              })
              .catch(err => {
                console.error('Error getting blob URL for PDF:', err);
                if (selectedLocation.imageUrl) {
                  onViewPdf(selectedLocation.imageUrl);
                }
              });
          }
        }}
      >
        <ImageNotSupportedIcon className="mr-2" /> View PDF
      </IconButton>
    </Box>
  );

  // Render loading state
  const renderLoading = () => (
    <Box className="flex flex-col items-center justify-center h-full">
      <CircularProgress size={60} />
      <Typography variant="body1" className="mt-4">
        Loading map...
      </Typography>
    </Box>
  );

  // Render no image selected message
  const renderNoImage = () => (
    <Box className="flex flex-col justify-center items-center h-full p-6">
      <Typography variant="body1" className="text-gray-500 text-center mb-4">
        {selectedLocation 
          ? "No image selected for this location or image couldn't be loaded."
          : "Select a location to view details."}
      </Typography>
      
      {selectedLocation && selectedLocation.imageUrl && (
        <Box className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-lg">
          <Typography variant="subtitle1" className="font-bold mb-2">Troubleshooting Tips:</Typography>
          <ul className="list-disc text-left pl-6 space-y-2">
            <li>Make sure you've imported your map images using the Asset Manager</li>
            <li>The current image path is: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">{selectedLocation.imageUrl}</code></li>
            <li>Try placing image files in the <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">public/images/</code> folder</li>
            <li>Check console for loading errors (Press F12 to open)</li>
          </ul>
        </Box>
      )}
    </Box>
  );

  // Render the component with improved styling for map display
  return (
    <Box
      ref={mapContainerRef}
      className={`relative w-full h-full overflow-hidden ${
        editMode ? 'cursor-crosshair' : 'cursor-default'
      }`}
      onClick={editMode ? onMapClick : undefined}
      onDragOver={editMode && onDragOver ? onDragOver : undefined}
      onDrop={editMode && onDrop ? onDrop : undefined}
    >
      {isImageLoading ? (
        renderLoading()
      ) : !imageUrl && !isPdf || !selectedLocation ? (
        <Box>
          {renderNoImage()}
        </Box>
      ) : isPdf ? (
        renderPdfMessage()
      ) : (
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={8}
          wheel={{ step: 0.1 }}
          limitToBounds={false}
          disablePadding={true}
          disabled={editMode} // Disable panning in edit mode
          ref={transformComponentRef}
          centerZoomedOut={true}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <React.Fragment>
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%'
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%'
                }}
              >
                <div className="w-full h-full flex justify-center items-center bg-background-elevated/10">
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={selectedLocation?.name || 'Map'}
                    className="max-w-full max-h-full object-contain"
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      setImageNaturalWidth(img.naturalWidth);
                      setImageNaturalHeight(img.naturalHeight);
                      setIsImageLoading(false);
                      
                      // Auto-fit the image to the viewport on initial load
                      if (transformComponentRef.current) {
                        setTimeout(() => {
                          resetTransform();
                        }, 100);
                      }
                    }}
                    onError={() => {
                      setIsImageLoading(false);
                    }}
                  />
                </div>
                <div className="absolute inset-0">
                  {renderLocationMarkers()}
                  {renderDirectionalArrows()}
                </div>
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      )}
    </Box>
  );
}; 