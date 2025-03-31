import { Character } from './character';

/**
 * Represents a reward item that can be earned from combat
 */
export interface RewardItem {
  /** Unique identifier for the reward */
  id: string;
  
  /** Name of the reward item */
  name: string;
  
  /** Optional detailed description of the reward */
  description?: string;
  
  /** Quantity of the reward item */
  quantity: number;
  
  /** Optional value or price of the reward */
  value?: number;
  
  /** Optional type or category of the reward */
  type?: string;
  
  /** Optional rarity of the reward */
  rarity?: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';
}

/**
 * Type for reward item creation without an ID (will be generated)
 */
export type RewardItemCreate = Omit<RewardItem, 'id'>;

/**
 * Represents an enemy instance in a combat encounter
 */
export interface EnemyInstance {
  /** Reference to the character data for this enemy */
  character: Character;
  
  /** Number of instances of this enemy */
  count: number;
}

/**
 * Difficulty levels for combat encounters
 */
export type CombatDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';

/**
 * Status of a combat encounter
 */
export type CombatStatus = 'planned' | 'active' | 'completed';

/**
 * Represents a combat encounter in the game
 */
export interface Combat {
  /** Unique identifier for the combat */
  id: string;
  
  /** Name of the combat encounter */
  name: string;
  
  /** Optional detailed description of the combat */
  description?: string;
  
  /** Optional difficulty level */
  difficulty?: CombatDifficulty;
  
  /** Optional status of the combat */
  status?: CombatStatus;
  
  /** Optional location ID where the combat takes place */
  locationId?: string;
  
  /** Optional background music track for this combat */
  backgroundMusic?: string;
  
  /** Optional start sound that plays when combat begins */
  startSound?: string;
  
  /** Optional background image for this combat */
  backgroundImage?: string;
  
  /** Enemy characters in this combat with their counts */
  enemies: EnemyInstance[];
  
  /** IDs of player characters participating in this combat */
  playerCharacterIds: string[];
  
  /** Optional round counter for active combats */
  round?: number;
  
  /** Optional turn counter for active combats */
  turn?: number;
  
  /** Optional rewards for completing the combat */
  rewards?: RewardItem[];
  
  /** Optional experience points awarded for completing the combat */
  experiencePoints?: number;
  
  /** Optional tags for filtering and organizing combats */
  tags?: string[];
  
  /** Optional notes about the combat */
  notes?: string;
  
  /** Optional creation date */
  createdAt?: Date | string;
  
  /** Optional last modified date */
  updatedAt?: Date | string;
}

/**
 * Type for combat creation without an ID (will be generated)
 */
export type CombatCreate = Omit<Combat, 'id'>;

/**
 * Type for combat updates (all fields are optional)
 */
export type CombatUpdate = Partial<Omit<Combat, 'id'>>;

/**
 * Initiative order entry for tracking combat turns
 */
export interface InitiativeEntry {
  /** ID of the entity (character) */
  entityId: string;
  
  /** Name of the entity */
  name: string;
  
  /** Initiative roll result */
  initiative: number;
  
  /** Whether this is a player character */
  isPlayerCharacter: boolean;
  
  /** Optional group identifier for enemies of the same type */
  groupId?: string;
  
  /** Current hit points */
  currentHp?: number;
  
  /** Maximum hit points */
  maxHp?: number;
  
  /** Whether the entity is active/conscious */
  isActive?: boolean;
  
  /** Optional conditions affecting the entity */
  conditions?: string[];
} 