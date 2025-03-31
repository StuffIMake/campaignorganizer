import { useState } from 'react';
import { Item } from '../../../store';

export const useItemForm = (
  initialInventory: Item[] = [],
  onInventoryChange: (inventory: Item[]) => void
) => {
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Item>({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    quantity: 1,
    price: undefined
  });
  
  const resetItemForm = () => {
    setNewItem({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      price: undefined
    });
  };
  
  const handleAddItem = () => {
    const updatedInventory = [...initialInventory, newItem];
    onInventoryChange(updatedInventory);
    setIsAddItemDialogOpen(false);
    resetItemForm();
  };
  
  const handleEditItemClick = (itemId: string) => {
    const itemToEdit = initialInventory.find(item => item.id === itemId);
    if (itemToEdit) {
      setNewItem({ ...itemToEdit });
      setEditingItemId(itemId);
      setIsEditItemDialogOpen(true);
    }
  };
  
  const handleSaveEditedItem = () => {
    if (editingItemId) {
      const updatedInventory = initialInventory.map(item => 
        item.id === editingItemId ? newItem : item
      );
      onInventoryChange(updatedInventory);
      setIsEditItemDialogOpen(false);
      setEditingItemId(null);
      resetItemForm();
    }
  };
  
  const handleDeleteItem = (itemId: string) => {
    const updatedInventory = initialInventory.filter(item => item.id !== itemId);
    onInventoryChange(updatedInventory);
  };
  
  const handleItemChange = (field: keyof Item, value: any) => {
    setNewItem(prev => ({
      ...prev,
      [field]: field === 'quantity' && typeof value === 'string' 
        ? parseInt(value) || 0 
        : field === 'price' && typeof value === 'string'
          ? parseFloat(value) || undefined
          : value
    }));
  };
  
  return {
    newItem,
    handleItemChange,
    isAddItemDialogOpen,
    setIsAddItemDialogOpen,
    isEditItemDialogOpen,
    setIsEditItemDialogOpen,
    editingItemId,
    handleAddItem,
    handleEditItemClick,
    handleSaveEditedItem,
    handleDeleteItem,
    resetItemForm
  };
}; 