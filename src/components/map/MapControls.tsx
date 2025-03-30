import React from 'react';
import { Box, Fab, Tooltip, Paper, Typography } from '../ui';
import { 
  EditIcon, 
  SaveIcon,
  DownloadIcon,
  ImageIcon,
  CloudUploadIcon
} from '../../assets/icons';

interface MapControlsProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onViewPdf?: () => void;
  hasPdf?: boolean;
  onOpenAssetManager?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  editMode,
  onToggleEditMode,
  onSave,
  onViewPdf,
  hasPdf,
  onOpenAssetManager
}) => {
  return (
    <>
      {/* Edit mode indicator */}
      {editMode && (
        <Paper
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 
                    bg-black/80 text-white rounded flex items-center gap-2"
        >
          <EditIcon className="text-sm" />
          <Typography variant="subtitle2">Edit Mode Active</Typography>
        </Paper>
      )}

      {/* Edit mode toggle button */}
      <Tooltip
        title={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
        placement="left"
      >
        <Fab
          color={editMode ? "secondary" : "primary"}
          aria-label="edit mode"
          className="absolute bottom-4 right-4 z-50"
          onClick={onToggleEditMode}
        >
          <EditIcon />
        </Fab>
      </Tooltip>
      
      {/* Save button when in edit mode */}
      {editMode && (
        <Tooltip
          title="Save all changes"
          placement="left"
        >
          <Fab
            color="success"
            aria-label="save changes"
            className="absolute bottom-4 right-20 z-50"
            onClick={onSave}
          >
            <SaveIcon />
          </Fab>
        </Tooltip>
      )}
      
      {/* PDF viewer button when available */}
      {hasPdf && onViewPdf && (
        <Tooltip
          title="View PDF Document"
          placement="left"
        >
          <Fab
            color="info"
            aria-label="view pdf"
            className="absolute bottom-20 right-4 z-50"
            onClick={onViewPdf}
          >
            <DownloadIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Asset Manager button */}
      {onOpenAssetManager && (
        <Tooltip
          title="Open Asset Manager"
          placement="left"
        >
          <Fab
            color="info"
            aria-label="open asset manager"
            className="absolute bottom-36 right-4 z-50"
            onClick={onOpenAssetManager}
          >
            <CloudUploadIcon />
          </Fab>
        </Tooltip>
      )}
    </>
  );
};

export default MapControls; 