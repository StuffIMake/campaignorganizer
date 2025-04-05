import { useRef, useState } from 'react';
import { CustomLocation } from '../../../store';
import { useStore } from '../../../store';

// Extended drag event type with our custom properties
interface ExtendedDragEvent extends React.DragEvent<HTMLDivElement> {
  locationX?: number;
  locationY?: number;
}

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
  
  // Handle drag over for allowing drop operations
  const handleDragOver = (e: React.DragEvent) => {
    if (!editMode) return;
    e.preventDefault(); // This is required to allow dropping
  };
  
  // Handle dropping a location on the map
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Check if the mapContainerRef is valid
    if (!mapContainerRef || !mapContainerRef.current) {
      console.error('Map container reference is null or not initialized');
      return;
    }
    
    // Get the dropped location ID
    const locationId = e.dataTransfer.getData('locationId');
    if (!locationId) return;
    
    // Calculate drop position as percentage of container dimensions
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = ((e.clientY) / rect.height);
    
    // Log the drop coordinates
    console.log(`Location ${locationId} dropped at ${x.toFixed(3)}, ${y.toFixed(3)}`);
    
    // Find the location to update using the store
    const { locations } = useStore.getState();
    const locationToUpdate = locations.find(loc => loc.id === locationId);
    
    if (locationToUpdate) {
      // Create updated location with new coordinates
      const updatedLocation = {
        ...locationToUpdate,
        coordinates: [x, y] as [number, number]
      };
      
      // Call onLocationUpdate with the complete updated location
      if (onLocationUpdate) {
        onLocationUpdate(updatedLocation);
      }
    } else {
      console.warn(`Could not find location with ID ${locationId}`);
    }
  };
  
  // Helper function to find a sublocation by ID recursively
  const getSublocationById = (parent: CustomLocation, id: string): CustomLocation | null => {
    // Check direct sublocations
    const directSublocation = parent.sublocations?.find(loc => loc.id === id);
    if (directSublocation) return directSublocation;
    
    // Recursively check nested sublocations
    for (const child of parent.sublocations || []) {
      const found = getSublocationById(child, id);
      if (found) return found;
    }
    
    return null;
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