import React, { useCallback } from 'react';
import { useJsonEditor } from '../hooks';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '../../../components/ui';
import { SaveIcon, CloseIcon } from '../../../assets/icons';
import { withMemo } from '../../../utils/performance';

const JsonEditorComponent: React.FC = () => {
  const {
    isJsonEditorOpen,
    jsonFileToEdit,
    jsonContent,
    isLoading,
    error,
    setIsJsonEditorOpen,
    setJsonContent,
    saveJsonContent
  } = useJsonEditor();
  
  // Handle saving the edited JSON
  const handleSave = useCallback(async () => {
    await saveJsonContent();
  }, [saveJsonContent]);
  
  // Handle closing the editor without saving
  const handleClose = useCallback(() => {
    if (isLoading) return; // Don't allow closing while saving
    
    const hasChanges = jsonContent !== '';
    if (hasChanges && !window.confirm('Are you sure you want to close without saving?')) {
      return;
    }
    
    setIsJsonEditorOpen(false);
  }, [isLoading, jsonContent, setIsJsonEditorOpen]);
  
  // Handle JSON content changes
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
  }, [setJsonContent]);
  
  return (
    <Dialog
      open={isJsonEditorOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="flex justify-between items-center">
        <span>
          {jsonFileToEdit ? `Editing: ${jsonFileToEdit}` : 'JSON Editor'}
        </span>
        
        <Button
          variant="text"
          onPress={handleClose}
          isDisabled={isLoading}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box className="flex justify-center items-center p-4">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
            
            <Box className="mb-2">
              <Typography variant="caption" className="block mb-1 text-gray-400">
                Edit the JSON data below. Make sure to keep valid JSON syntax.
              </Typography>
            </Box>
            
            <textarea
              className="w-full h-80 p-3 font-mono bg-gray-900 text-gray-200 border border-gray-700 rounded"
              value={jsonContent}
              onChange={handleContentChange}
            />
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onPress={handleSave}
          isDisabled={isLoading || !jsonContent}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const JsonEditor = withMemo(JsonEditorComponent, 'JsonEditor'); 