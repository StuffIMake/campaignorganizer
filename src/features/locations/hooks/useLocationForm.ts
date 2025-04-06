import { useState } from 'react';
import { CustomLocation } from '../../../store';
import { MapPosition } from '../../../types/location';

interface LocationFormData {
  name: string;
  description: string;
  backgroundMusic: string;
  entrySound: string;
  imageUrl: string;
  descriptionType: 'markdown' | 'image' | 'pdf';
  parentLocationId: string;
  coordinates: [number | string, number | string];
  mixWithParent: boolean;
  connectedLocations: string[];
}

// Helper function to format coordinates for API
const formatCoordinatesForAPI = (coords: [number | string, number | string]): [number, number] => {
  return [
    typeof coords[0] === 'string' ? parseFloat(coords[0]) || 0 : coords[0],
    typeof coords[1] === 'string' ? parseFloat(coords[1]) || 0 : coords[1]
  ];
};

// Helper function to convert any coordinate format to form format
const getFormCoordinates = (coordinates?: MapPosition | [number, number]): [number | string, number | string] => {
  if (!coordinates) return [0, 0];
  if (Array.isArray(coordinates)) {
    return coordinates;
  }
  return [coordinates.x, coordinates.y];
};

export const useLocationForm = (onAdd: (location: Partial<CustomLocation>) => void, onUpdate: (id: string, location: Partial<CustomLocation>) => void) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  
  // Separate search states for each dropdown
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [connectedSearchQuery, setConnectedSearchQuery] = useState('');
  const [bgMusicSearchQuery, setBgMusicSearchQuery] = useState('');
  const [entrySoundSearchQuery, setEntrySoundSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    backgroundMusic: '',
    entrySound: '',
    imageUrl: '',
    descriptionType: 'markdown',
    parentLocationId: '',
    coordinates: [0, 0],
    mixWithParent: false,
    connectedLocations: []
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      backgroundMusic: '',
      entrySound: '',
      imageUrl: '',
      descriptionType: 'markdown',
      parentLocationId: '',
      coordinates: [0, 0],
      mixWithParent: false,
      connectedLocations: []
    });
    setImageSearchQuery('');
    setParentSearchQuery('');
    setConnectedSearchQuery('');
    setBgMusicSearchQuery('');
    setEntrySoundSearchQuery('');
  };

  const handleAddLocation = () => {
    onAdd({
      name: formData.name,
      description: formData.description,
      backgroundMusic: formData.backgroundMusic || undefined,
      entrySound: formData.entrySound || undefined,
      imageUrl: formData.imageUrl || undefined,
      descriptionType: formData.descriptionType,
      coordinates: formatCoordinatesForAPI(formData.coordinates),
      parentLocationId: formData.parentLocationId || undefined,
      mixWithParent: formData.mixWithParent,
      connectedLocations: formData.connectedLocations.length > 0 ? formData.connectedLocations : undefined
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };
  
  const handleEditLocation = (location: CustomLocation) => {
    setEditingLocationId(location.id);
    setFormData({
      name: location.name,
      description: location.description,
      backgroundMusic: location.backgroundMusic || '',
      entrySound: location.entrySound || '',
      imageUrl: location.imageUrl || '',
      descriptionType: location.descriptionType || 'markdown',
      parentLocationId: location.parentLocationId || '',
      coordinates: getFormCoordinates(location.coordinates),
      mixWithParent: location.mixWithParent || false,
      connectedLocations: location.connectedLocations || []
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSaveLocation = () => {
    if (editingLocationId) {
      onUpdate(editingLocationId, {
        name: formData.name,
        description: formData.description,
        backgroundMusic: formData.backgroundMusic || undefined,
        entrySound: formData.entrySound || undefined,
        imageUrl: formData.imageUrl || undefined,
        descriptionType: formData.descriptionType,
        coordinates: formatCoordinatesForAPI(formData.coordinates),
        parentLocationId: formData.parentLocationId || undefined,
        mixWithParent: formData.mixWithParent,
        connectedLocations: formData.connectedLocations.length > 0 ? formData.connectedLocations : undefined
      });
      
      setIsEditDialogOpen(false);
      setEditingLocationId(null);
      resetForm();
    }
  };
  
  const handleChange = (field: keyof LocationFormData, value: any) => {
    console.log(`handleChange called: field=${field}, value=`, value, "type=", typeof value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return {
    formData,
    handleChange,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingLocationId,
    imageSearchQuery,
    setImageSearchQuery,
    parentSearchQuery,
    setParentSearchQuery,
    connectedSearchQuery,
    setConnectedSearchQuery,
    bgMusicSearchQuery,
    setBgMusicSearchQuery,
    entrySoundSearchQuery,
    setEntrySoundSearchQuery,
    handleAddLocation,
    handleEditLocation,
    handleSaveLocation,
    resetForm
  };
}; 