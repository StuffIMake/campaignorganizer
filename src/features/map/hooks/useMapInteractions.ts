import { useRef, useState } from 'react';
import { CustomLocation } from '../../../store';

interface UseMapInteractionsProps {
  editMode: boolean;
  selectedLocation: CustomLocation | null;
  onLocationUpdate: (location: CustomLocation) => void;
}

export const useMapInteractions = ({
  editMode,
  selectedLocation,
  onLocationUpdate
}: UseMapInteractionsProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCharacterId, setDraggedCharacterId] = useState<string | null>(null);
  
  // Handle map click to add a new location in edit mode
  const handleMapClick = (e: React.MouseEvent) => {
    if (!editMode || !selectedLocation) return;
    
    // Get the target element and its bounding rectangle
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate coordinates as percentages within the container
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    console.log(`Clicked at position: ${x.toFixed(2)}, ${y.toFixed(2)}`);
    
    // Here we could implement logic for adding a new location at the clicked position
    // or other map interactions in edit mode
  };
  
  // Handle drag over for character dragging
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    
    if (isDragging) {
      // Update visual feedback during drag if needed
    }
  };
  
  // Handle dropping a character on the map or a location
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedCharacterId || !selectedLocation) return;
    
    // Get the map container dimensions
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;
    
    const rect = mapContainer.getBoundingClientRect();
    
    // Calculate drop position as percentages
    const dropX = (e.clientX - rect.left) / rect.width;
    const dropY = (e.clientY - rect.top) / rect.height;
    
    console.log(`Character ${draggedCharacterId} dropped at position: ${dropX.toFixed(2)}, ${dropY.toFixed(2)}`);
    
    // Reset drag state
    setIsDragging(false);
    setDraggedCharacterId(null);
    
    // Here we would implement logic to update character position on the map
  };
  
  // Handle starting character drag
  const handleCharacterDragStart = (characterId: string) => {
    setIsDragging(true);
    setDraggedCharacterId(characterId);
  };
  
  // Handle dropping a character on a specific location
  const handleLocationDrop = (e: React.DragEvent, locationId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Stop the event from propagating to the map container
    
    if (!draggedCharacterId) return;
    
    console.log(`Character ${draggedCharacterId} dropped on location ${locationId}`);
    
    // Reset drag state
    setIsDragging(false);
    setDraggedCharacterId(null);
    
    // Here we would implement logic to update character's location
  };
  
  return {
    mapContainerRef,
    isDragging,
    draggedCharacterId,
    handleMapClick,
    handleDragOver,
    handleDrop,
    handleCharacterDragStart,
    handleLocationDrop
  };
}; 