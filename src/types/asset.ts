/**
 * Types of assets supported by the application
 */
export type AssetType = 'audio' | 'images' | 'data';

/**
 * Represents an asset entry in the storage
 */
export interface AssetEntry {
  /** Name of the asset (acts as the key) */
  name: string;
  
  /** Base64 encoded data of the asset */
  data: string;
  
  /** MIME type of the asset */
  type: string;
  
  /** Timestamp when the asset was last modified */
  lastModified: number;
  
  /** Optional size in bytes */
  size?: number;
  
  /** Optional metadata for the asset */
  metadata?: Record<string, any>;
}

/**
 * Result of asset operations like import, export, delete
 */
export interface AssetOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  
  /** Message describing the result */
  message: string;
  
  /** Optional URL for download operations */
  url?: string;
  
  /** Optional blob for export operations */
  zipBlob?: Blob;
}

/**
 * Asset store state interface
 */
export interface AssetState {
  /** List of audio asset names */
  audioAssets: string[];
  
  /** List of image asset names */
  imageAssets: string[];
  
  /** List of data asset names */
  dataAssets: string[];
  
  /** Whether any assets are present in storage */
  hasAssets: boolean;
  
  /** Whether assets are currently being loaded */
  isLoading: boolean;
}

/**
 * Configuration for an audio track
 */
export interface AudioTrack {
  /** Unique identifier for the track */
  id: string;
  
  /** Name of the track */
  name: string;
  
  /** URL or asset name for the track */
  url: string;
  
  /** Whether the track should loop */
  loop?: boolean;
  
  /** Volume level (0.0 - 1.0) */
  volume?: number;
  
  /** Whether the track is currently muted */
  isMuted?: boolean;
  
  /** Optional location ID this track is associated with */
  locationId?: string;
}

/**
 * Active (currently playing) audio track
 */
export interface ActiveTrack extends AudioTrack {
  /** Howler instance for the track */
  howl: any; // Using any for Howl type since it's from an external library
} 