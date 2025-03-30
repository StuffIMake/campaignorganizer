// Define the types used in the application

export interface Location {
  id: string;
  name: string;
  description: string;
  type?: string;
  parentId?: string | null;
  descriptionType?: 'markdown' | 'image' | 'pdf';
  descriptionAssetName?: string;
  mapUrl?: string;
  mapSettings?: Record<string, any>;
  position?: { x: number, y: number };
}

export interface Character {
  id: string;
  name: string;
  description: string;
  type: 'npc' | 'merchant' | 'enemy' | 'player';
  hp: number;
  locationId?: string;
  descriptionType?: 'markdown' | 'image' | 'pdf';
  descriptionAssetName?: string;
  inventory?: Item[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price?: number;
}

export interface Combat {
  id: string;
  name: string;
  description: string;
  locationId?: string;
  characters: string[]; // Array of character IDs
  status: 'planned' | 'active' | 'completed';
  round?: number;
  initiative?: Record<string, number>;
  turnOrder?: string[];
  currentTurn?: number;
} 