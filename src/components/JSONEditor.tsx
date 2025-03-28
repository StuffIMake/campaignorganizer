import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  CircularProgress,
  Alert
} from '@mui/material';
import { AssetManager } from '../services/assetManager';
import { useStore } from '../store';

interface JSONEditorProps {
  fileName: string;
  onSave?: (success: boolean) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ fileName, onSave }) => {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const loadJsonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load the JSON data
        const data = await AssetManager.getAssetByName('data', fileName);
        
        if (!data) {
          setError(`Could not load JSON file: ${fileName}`);
          setLoading(false);
          return;
        }
        
        let jsonString = '';
        
        // If data.data is already a JSON string
        if (typeof data.data === 'string' && (data.data.startsWith('{') || data.data.startsWith('['))) {
          jsonString = data.data;
        } else {
          // Try to decode base64 if needed (for backward compatibility)
          try {
            jsonString = window.atob(data.data);
          } catch (e) {
            jsonString = data.data;
          }
        }
        
        // Format the JSON for better readability
        try {
          const parsedJson = JSON.parse(jsonString);
          const formattedJson = JSON.stringify(parsedJson, null, 2);
          setJsonContent(formattedJson);
          setOriginalContent(formattedJson);
        } catch (e) {
          // If parsing fails, use the raw string
          setJsonContent(jsonString);
          setOriginalContent(jsonString);
          setError(`Warning: Content may not be valid JSON`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading JSON data:', err);
        setError(`Error loading data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    if (fileName) {
      loadJsonData();
    }
  }, [fileName]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    // Clear previous messages when content changes
    setSaveMessage(null);
  };
  
  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleSave = async () => {
    // Validate JSON before saving
    if (!validateJson(jsonContent)) {
      setSaveMessage({
        type: 'error',
        message: 'Invalid JSON. Please correct the syntax errors before saving.'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Create asset entry directly with the json content
      const result = await AssetManager.saveDataObject(fileName, JSON.parse(jsonContent));
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          message: result.message
        });
        
        // Update original content to reflect saved state
        setOriginalContent(jsonContent);
        
        // If this is one of the core state files, refresh the store state
        if (fileName === 'locations.json' || fileName === 'characters.json' || fileName === 'combats.json') {
          try {
            // Trigger a refresh of the store's data from IndexedDB
            await useStore.getState().refreshAssets();
          } catch (err) {
            console.error('Error refreshing store after JSON save:', err);
          }
        }
        
        if (onSave) {
          onSave(true);
        }
      } else {
        setSaveMessage({
          type: 'error',
          message: result.message
        });
        
        if (onSave) {
          onSave(false);
        }
      }
    } catch (err) {
      console.error('Error saving JSON:', err);
      setSaveMessage({
        type: 'error',
        message: `Error saving JSON: ${err instanceof Error ? err.message : String(err)}`
      });
      
      if (onSave) {
        onSave(false);
      }
    } finally {
      setSaving(false);
    }
  };
  
  const handleFormat = () => {
    try {
      // Parse and format the JSON
      const parsedJson = JSON.parse(jsonContent);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setJsonContent(formattedJson);
      setSaveMessage(null);
    } catch (e) {
      setSaveMessage({
        type: 'error',
        message: 'Invalid JSON. Cannot format.'
      });
    }
  };

  const hasChanges = jsonContent !== originalContent;
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Editing {fileName}
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="JSON Content"
        fullWidth
        multiline
        rows={15}
        value={jsonContent}
        onChange={handleContentChange}
        variant="outlined"
        sx={{ 
          mb: 2,
          fontFamily: 'monospace',
          '& .MuiInputBase-input': {
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }
        }}
        error={saveMessage?.type === 'error'}
        helperText={saveMessage?.type === 'error' ? saveMessage.message : ''}
      />
      
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button 
          variant="outlined" 
          onClick={handleFormat}
          disabled={saving}
        >
          Format
        </Button>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Box>
      
      {saveMessage?.type === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {saveMessage.message}
        </Alert>
      )}
    </Paper>
  );
};

export default JSONEditor; 