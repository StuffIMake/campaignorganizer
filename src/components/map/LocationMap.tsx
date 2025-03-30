import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { CustomLocation } from '../../store';
import { Box, Tooltip, IconButton, Typography, CircularProgress } from '../ui';
import { PlaceIcon, NorthIcon, ImageNotSupportedIcon } from '../../assets/icons';
import { AssetManager } from '../../services/assetManager';

interface LocationMapProps {
  selectedLocation: CustomLocation | null;
  onLocationSelect: (location: CustomLocation) => void;
  getSublocationsByParentId: (parentId: string) => CustomLocation[];
  locations: CustomLocation[];
  editMode?: boolean;
  onMapClick?: (e: React.MouseEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
  selectedLocation,
  onLocationSelect,
  getSublocationsByParentId,
  locations,
  editMode = false,
  onMapClick,
  onDrop,
  onDragOver
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [imageNaturalWidth, setImageNaturalWidth] = useState(0);
  const [imageNaturalHeight, setImageNaturalHeight] = useState(0);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

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
              // Normal image handling
              const url = await AssetManager.getAssetUrl('images', selectedLocation.imageUrl);
              setImageUrl(url);
            }
          } else {
            // Clear the image URL if no image is selected
            setImageUrl('');
            setIsPdf(false);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageUrl('');
          setIsPdf(false);
        } finally {
          setIsImageLoading(false);
        }
      };
      loadImage();
    }
  }, [selectedLocation?.id, selectedLocation?.imageUrl]);

  // Reset transform when entering edit mode
  useEffect(() => {
    if (editMode && transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  }, [editMode]);

  // Handler for drag start on a location marker
  const handleDragStart = (locationId: string, e: React.DragEvent) => {
    if (!editMode) return;
    
    // Set a transparent drag image (prevents the default element preview)
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    
    e.dataTransfer.setData('locationId', locationId);
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
        loc.coordinates && selectedLocation.coordinates // Only if both have coordinates
      )
      .map(connectedLoc => {
        if (!selectedLocation.coordinates || !connectedLoc.coordinates) return null;

        // Calculate angle for rotation
        const angleDeg = calculateAngle(
          selectedLocation.coordinates, 
          connectedLoc.coordinates
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
              className="absolute z-10 bg-black/50 hover:bg-black/80 text-white"
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
      if (!sublocation.coordinates) return null;

      const [relX, relY] = sublocation.coordinates;
      const isSelected = selectedLocation?.id === sublocation.id;

      return (
        <Tooltip 
          key={sublocation.id} 
          title={editMode ? "Drag to move, click to edit" : sublocation.name}
          arrow
          placement="top"
        >
          <Box
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-5 hover:scale-110 transition-transform duration-200"
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
          // To be implemented - open PDF viewer
          console.log('Open PDF viewer');
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
    <Box className="flex justify-center items-center h-full">
      <Typography variant="body1" className="text-gray-500">
        {selectedLocation 
          ? "No image selected for this location. Edit the location to add an image."
          : "Select a location to view details."}
      </Typography>
    </Box>
  );

  return (
    <Box
      ref={mapContainerRef}
      className={`relative flex-1 h-full overflow-hidden ${
        editMode ? 'cursor-crosshair' : 'cursor-default'
      }`}
      onClick={onMapClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isImageLoading ? (
        renderLoading()
      ) : !imageUrl && !isPdf || !selectedLocation ? (
        renderNoImage()
      ) : isPdf ? (
        renderPdfMessage()
      ) : (
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          wheel={{ step: 0.1 }}
          limitToBounds={false}
          disablePadding={true}
          disabled={editMode}
          ref={transformComponentRef}
        >
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0,
            }}
            contentStyle={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box 
              className="relative flex justify-center items-center w-full h-full"
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt={selectedLocation?.name || 'Map'}
                className="max-w-full max-h-full object-contain relative z-1"
                onLoad={(e) => {
                  setIsImageLoading(false);
                  // Store natural dimensions for coordinate calculations
                  const img = e.target as HTMLImageElement;
                  setImageNaturalWidth(img.naturalWidth);
                  setImageNaturalHeight(img.naturalHeight);
                }}
                onError={() => setIsImageLoading(false)}
              />
              {renderLocationMarkers()}
              {renderDirectionalArrows()}
            </Box>
          </TransformComponent>
        </TransformWrapper>
      )}
    </Box>
  );
};

export default LocationMap; 