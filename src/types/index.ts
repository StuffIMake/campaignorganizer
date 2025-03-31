// Export location types
export * from './location';

// Export character types
export * from './character';

// Export combat types
export * from './combat';

// Export asset types
export * from './asset';

/**
 * Generic success response
 */
export interface SuccessResponse {
  success: boolean;
  message: string;
}

/**
 * Application settings 
 */
export interface AppSettings {
  /** Whether to show tooltips */
  showTooltips: boolean;
  
  /** Whether to enable sound effects */
  enableSoundEffects: boolean;
  
  /** Whether to enable background music */
  enableMusic: boolean;
  
  /** Default volume for music (0.0 - 1.0) */
  musicVolume: number;
  
  /** Default volume for sound effects (0.0 - 1.0) */
  sfxVolume: number;
  
  /** Theme preference (light, dark, system) */
  theme: 'light' | 'dark' | 'system';
  
  /** Whether to use compact mode for UI */
  compactMode: boolean;
}

/**
 * Base state interface for all store slices
 */
export interface BaseState {
  /** Whether data is currently being loaded */
  isLoading: boolean;
  
  /** Any error message to display */
  error: string | null;
}

/**
 * Dialog configuration for confirm dialogs
 */
export interface ConfirmDialogConfig {
  /** Dialog title */
  title: string;
  
  /** Dialog message/content */
  message: string;
  
  /** Text for confirm button */
  confirmText?: string;
  
  /** Text for cancel button */
  cancelText?: string;
  
  /** Action to perform on confirmation */
  onConfirm: () => void;
  
  /** Whether the dialog is currently open */
  open: boolean;
} 