import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Character, Item } from '../../../store';
import { AssetManager } from '../../../services/assetManager';
import { BaseState } from '../../../types/index';

export interface CharactersState extends BaseState {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  
  // Item management methods
  addItemToCharacter: (characterId: string, item: Omit<Item, 'id'>) => void;
  updateCharacterItem: (characterId: string, itemId: string, updates: Partial<Item>) => void;
  deleteCharacterItem: (characterId: string, itemId: string) => void;
  
  // Fetch characters action
  fetchCharacters: () => Promise<void>;
}

export const createCharactersSlice: StateCreator<
  CharactersState,
  [],
  [],
  CharactersState
> = (set, get) => ({
  characters: [],
  isLoading: false,
  error: null,
  
  addCharacter: (character) => {
    const newCharacter: Character = {
      id: uuidv4(),
      ...character,
    };
    
    set((state) => ({
      characters: [...state.characters, newCharacter]
    }));
  },
  
  updateCharacter: (id, updates) => {
    set((state) => ({
      characters: state.characters.map(character => 
        character.id === id ? { ...character, ...updates } : character
      )
    }));
  },
  
  deleteCharacter: (id) => {
    set((state) => ({
      characters: state.characters.filter(character => character.id !== id)
    }));
  },
  
  // Item management implementations
  addItemToCharacter: (characterId, item) => {
    const newItem: Item = {
      id: uuidv4(),
      ...item
    };
    
    set((state) => ({
      characters: state.characters.map(character => {
        if (character.id !== characterId) return character;
        
        return {
          ...character,
          inventory: [
            ...(character.inventory || []),
            newItem
          ]
        };
      })
    }));
  },
  
  updateCharacterItem: (characterId, itemId, updates) => {
    set((state) => ({
      characters: state.characters.map(character => {
        if (character.id !== characterId) return character;
        if (!character.inventory) return character;
        
        return {
          ...character,
          inventory: character.inventory.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      })
    }));
  },
  
  deleteCharacterItem: (characterId, itemId) => {
    set((state) => ({
      characters: state.characters.map(character => {
        if (character.id !== characterId) return character;
        if (!character.inventory) return character;
        
        return {
          ...character,
          inventory: character.inventory.filter(item => item.id !== itemId)
        };
      })
    }));
  },
  
  fetchCharacters: async () => {
    try {
      set({ isLoading: true, error: null } as Partial<CharactersState>);
      const charactersData = await AssetManager.getDataObject<Character[]>('characters.json');
      set({ 
        characters: charactersData || [],
        isLoading: false 
      } as Partial<CharactersState>);
    } catch (error) {
      set({ 
        error: `Failed to fetch characters: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false 
      } as Partial<CharactersState>);
    }
  }
}); 