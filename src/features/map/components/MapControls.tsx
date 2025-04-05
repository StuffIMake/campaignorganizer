import React from 'react';
import { 
  EditIcon, 
  SaveIcon,
  DownloadIcon,
  ImageIcon,
  CloudUploadIcon
} from '../../../assets/icons';

interface MapControlsProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onViewPdf?: () => void;
  hasPdf?: boolean;
  onOpenAssetManager?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  editMode,
  onToggleEditMode,
  onSave,
  onViewPdf,
  hasPdf,
  onOpenAssetManager
}) => {
  return (
    <>
      {/* Edit Mode Toggle Button */}
      <button
        className={`absolute bottom-4 right-4 z-50 
          h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all 
          ${editMode 
            ? 'bg-secondary-DEFAULT hover:bg-secondary-dark text-white' 
            : 'glass-effect-strong hover:bg-background-elevated/50'
          }`}
        onClick={onToggleEditMode}
        aria-label={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
        title={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
      >
        <EditIcon className="h-6 w-6" />
      </button>

      {/* Save Button - Only visible in edit mode */}
      {editMode && (
        <button
          className="absolute bottom-4 right-20 z-50 
            h-14 w-14 rounded-full flex items-center justify-center shadow-lg
            bg-primary-DEFAULT hover:bg-primary-dark text-white transition-all"
          onClick={onSave}
          aria-label="Save Changes"
          title="Save Changes"
        >
          <SaveIcon className="h-6 w-6" />
        </button>
      )}

      {/* PDF Viewer Button - Only visible when a PDF is available */}
      {hasPdf && onViewPdf && (
        <button
          className="absolute bottom-20 right-4 z-50 
            h-14 w-14 rounded-full flex items-center justify-center shadow-lg
            glass-effect-strong hover:bg-background-elevated/50 transition-all"
          onClick={onViewPdf}
          aria-label="View PDF"
          title="View PDF"
        >
          <ImageIcon className="h-6 w-6" />
        </button>
      )}

      {/* Asset Manager Button */}
      {onOpenAssetManager && (
        <button
          className="absolute bottom-36 right-4 z-50 
            h-14 w-14 rounded-full flex items-center justify-center shadow-lg
            glass-effect-strong hover:bg-background-elevated/50 transition-all"
          onClick={onOpenAssetManager}
          aria-label="Open Asset Manager"
          title="Open Asset Manager"
        >
          <CloudUploadIcon className="h-6 w-6" />
        </button>
      )}
    </>
  );
}; 