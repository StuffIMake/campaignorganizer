/**
 * Represents an item in a character's inventory
 */
export interface Item {
  /** Unique identifier for the item */
  id: string;
  
  /** Name of the item */
  name: string;
  
  /** Optional detailed description of the item */
  description?: string;
  
  /** Quantity of the item */
  quantity: number;
  
  /** Optional price of the item */
  price?: number;
  
  /** Optional weight of the item */
  weight?: number;
  
  /** Optional item type or category */
  type?: string;
  
  /** Optional tags for filtering and organizing items */
  tags?: string[];
  
  /** Optional custom properties as key-value pairs */
  properties?: Record<string, any>;
}

/**
 * Type for item creation without an ID (will be generated)
 */
export type ItemCreate = Omit<Item, 'id'>;

/**
 * Type for item updates (all fields are optional)
 */
export type ItemUpdate = Partial<Omit<Item, 'id'>>;

/**
 * Represents a character ability score (like Strength, Dexterity, etc.)
 */
export interface AbilityScore {
  /** Name of the ability */
  name: string;
  
  /** Score value */
  value: number;
  
  /** Optional modifier calculated from the value */
  modifier?: number;
}

/**
 * Represents a character stat (like HP, AC, etc.)
 */
export interface CharacterStat {
  /** Name of the stat */
  name: string;
  
  /** Current value of the stat */
  current: number;
  
  /** Maximum value of the stat */
  max: number;
  
  /** Optional temporary value */
  temporary?: number;
}

/**
 * Defines the type of character description content
 */
export type DescriptionType = 'markdown' | 'image' | 'pdf';

/**
 * Represents a character in the game
 */
export interface Character {
  /** Unique identifier for the character */
  id: string;
  
  /** Name of the character */
  name: string;
  
  /** Optional detailed description of the character */
  description?: string;
  
  /** Type of the description content */
  descriptionType?: DescriptionType;
  
  /** Optional asset name for the description (if type is image or pdf) */
  descriptionAssetName?: string;
  
  /** Optional portrait image asset name */
  portraitImage?: string;
  
  /** Optional token image asset name for map representation */
  tokenImage?: string;
  
  /** Optional character class or type */
  characterClass?: string;
  
  /** Optional character level */
  level?: number;
  
  /** Optional character race or species */
  race?: string;
  
  /** Optional location ID where the character is currently located */
  locationId?: string;
  
  /** Optional character stats like HP, AC, etc. */
  stats?: CharacterStat[];
  
  /** Optional character ability scores */
  abilityScores?: AbilityScore[];
  
  /** Optional inventory items */
  inventory?: Item[];
  
  /** Whether this is a player character (true) or NPC (false) */
  isPlayerCharacter?: boolean;
  
  /** Optional tags for filtering and organizing characters */
  tags?: string[];
  
  /** Optional notes about the character */
  notes?: string;
}

/**
 * Type for character creation without an ID (will be generated)
 */
export type CharacterCreate = Omit<Character, 'id'>;

/**
 * Type for character updates (all fields are optional)
 */
export type CharacterUpdate = Partial<Omit<Character, 'id'>>;

/**
 * Represents a character position on a map
 */
export interface CharacterMapPosition {
  /** Character ID */
  characterId: string;
  
  /** X coordinate as a percentage (0-100) */
  x: number;
  
  /** Y coordinate as a percentage (0-100) */
  y: number;
  
  /** Optional location ID this position is associated with */
  locationId?: string;
} 