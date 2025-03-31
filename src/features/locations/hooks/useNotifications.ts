import { useState } from 'react';

export const useNotifications = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const showNotification = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  const hideNotification = () => {
    setSnackbarOpen(false);
  };
  
  return {
    snackbarOpen,
    snackbarMessage,
    showNotification,
    hideNotification
  };
}; 