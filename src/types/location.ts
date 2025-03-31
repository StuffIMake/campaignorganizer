/**
 * @file location.ts
 * @description Type definitions for location-related data structures
 */

/**
 * Type of description content in a location
 */
export type LocationDescriptionType = 'markdown' | 'image' | 'pdf';

/**
 * Represents a position on the map as percentages
 */
export interface MapPosition {
  /** X coordinate as percentage (0-100) */
  x: number;
  
  /** Y coordinate as percentage (0-100) */
  y: number;
}

/**
 * Map configuration settings
 */
export interface MapConfig {
  /** Width of the map in pixels */
  worldWidth: number;
  
  /** Height of the map in pixels */
  worldHeight: number;
}

/**
 * Represents a location in the game world
 */
export interface Location {
  /** Unique identifier for the location */
  id: string;
  
  /** Name of the location */
  name: string;
  
  /** Description text or content for the location */
  description: string;
  
  /** Type of the description content (markdown, image, PDF) */
  descriptionType?: LocationDescriptionType;
  
  /** Background music asset name to play when viewing this location */
  backgroundMusic?: string;
  
  /** Sound effect to play when entering this location */
  entrySound?: string;
  
  /** Image asset name to display for this location */
  imageUrl?: string;
  
  /** Whether audio from this location should be mixed with parent location audio */
  mixWithParent?: boolean;
  
  /** Position coordinates on the map (as percentages) */
  coordinates?: MapPosition;
  
  /** IDs of locations connected to this one */
  connectedLocations?: string[];
  
  /** ID of the parent location if this is a sublocation */
  parentLocationId?: string;
}

/**
 * Data needed to create a new location (without ID)
 */
export type LocationCreate = Omit<Location, 'id'>;

/**
 * Data for updating an existing location (all fields optional except id)
 */
export type LocationUpdate = Partial<Omit<Location, 'id'>> & { id: string }; 