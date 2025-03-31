import React, { useCallback } from 'react';
import { useJsonEditor } from '../hooks';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '../../../components/ui';
import { AddIcon, CloseIcon } from '../../../assets/icons';
import { withMemo } from '../../../utils/performance';

const NewJsonDialogComponent: React.FC = () => {
  const {
    isCreateJsonOpen,
    newJsonFileName,
    isLoading,
    error,
    setIsCreateJsonOpen,
    setNewJsonFileName,
    createNewJsonFile
  } = useJsonEditor();
  
  // Handle creating a new JSON file
  const handleCreate = useCallback(async () => {
    // Validate filename
    if (!newJsonFileName) {
      return;
    }
    
    await createNewJsonFile();
  }, [newJsonFileName, createNewJsonFile]);
  
  // Handle closing the dialog
  const handleClose = useCallback(() => {
    if (isLoading) return;
    setIsCreateJsonOpen(false);
  }, [isLoading, setIsCreateJsonOpen]);
  
  // Handle filename input changes
  const handleFileNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewJsonFileName(e.target.value);
  }, [setNewJsonFileName]);
  
  return (
    <Dialog
      open={isCreateJsonOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New JSON File</DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <CircularProgress />
          </div>
        ) : (
          <>
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
            
            <Typography variant="body2" className="mb-4">
              Enter a name for the new JSON file. The file will be created with empty JSON structure.
            </Typography>
            
            <TextField
              label="File Name"
              placeholder="example.json"
              value={newJsonFileName}
              onChange={handleFileNameChange}
              fullWidth
              helperText="File name will have .json extension added if not provided"
            />
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoading || !newJsonFileName}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const NewJsonDialog = withMemo(NewJsonDialogComponent, 'NewJsonDialog'); 