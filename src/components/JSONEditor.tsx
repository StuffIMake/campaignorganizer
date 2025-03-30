import React, { useState, useEffect } from 'react';
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
      
      // Parse the JSON data
      const parsedData = JSON.parse(jsonContent);
      
      // Create asset entry directly with the json content
      const result = await AssetManager.saveDataObject(fileName, parsedData);
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          message: result.message
        });
        
        // Update original content to reflect saved state
        setOriginalContent(jsonContent);
        
        // If this is one of the core state files, update the store's state
        if (fileName === 'locations.json' || fileName === 'characters.json' || fileName === 'combats.json') {
          try {
            // Update the store state
            if (fileName === 'locations.json') {
              useStore.setState({ locations: parsedData });
            } else if (fileName === 'characters.json') {
              useStore.setState({ characters: parsedData });
            } else if (fileName === 'combats.json') {
              useStore.setState({ combats: parsedData });
            }
          } catch (err) {
            console.error('Error updating store state after JSON save:', err);
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
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-medium text-white mb-3">
        Editing {fileName}
      </h2>
      
      {error && (
        <div className="bg-amber-900/50 text-amber-200 p-3 rounded-md mb-4 border border-amber-700/50">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1">JSON Content</label>
        <textarea
          className={`w-full h-[300px] px-3 py-2 bg-slate-900 border rounded font-mono text-sm ${
            saveMessage?.type === 'error' ? 'border-red-500' : 'border-slate-600'
          } text-white`}
          value={jsonContent}
          onChange={handleContentChange}
        />
        {saveMessage?.type === 'error' && (
          <p className="text-red-500 text-xs mt-1">{saveMessage.message}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-3">
        <button 
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleFormat}
          disabled={saving}
        >
          Format
        </button>
        
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full mx-auto"></div>
          ) : 'Save'}
        </button>
      </div>
      
      {saveMessage?.type === 'success' && (
        <div className="bg-green-900/50 text-green-200 p-3 rounded-md mt-4 border border-green-700/50">
          <p className="text-sm">{saveMessage.message}</p>
        </div>
      )}
    </div>
  );
};

export default JSONEditor; 