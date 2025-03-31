import { StateCreator } from 'zustand';
import { AssetManager } from '../../services/assetManager';
import { 
  Combat, 
  CombatCreate, 
  CombatUpdate, 
  RewardItem, 
  InitiativeEntry, 
  BaseState 
} from '../../types';

/**
 * Combats slice state interface
 */
export interface CombatsState extends BaseState {
  /** List of all combats */
  combats: Combat[];
  
  /** ID of the currently active combat session, if any */
  activeCombatId: string | null;
  
  /** Initiative order for the active combat */
  initiativeOrder: InitiativeEntry[];
  
  /** Current round in the active combat */
  currentRound: number;
  
  /** Index of the current turn in initiative order */
  currentTurnIndex: number;
  
  /** Whether data is currently being loaded */
  isLoading: boolean;
  
  /** Any error message to display */
  error: string | null;
}

/**
 * Combats slice actions interface
 */
export interface CombatsActions {
  /** Fetch combats from storage */
  fetchCombats: () => Promise<void>;
  
  /** Add a new combat */
  addCombat: (combat: CombatCreate) => Promise<Combat>;
  
  /** Update an existing combat */
  updateCombat: (combatId: string, updates: CombatUpdate) => Promise<Combat | null>;
  
  /** Delete a combat */
  deleteCombat: (combatId: string) => Promise<boolean>;
  
  /** Start a combat session */
  startCombatSession: (combatId: string) => Promise<boolean>;
  
  /** End the active combat session */
  endCombatSession: () => void;
  
  /** Set up initiative order for a combat */
  setupInitiative: (entries: InitiativeEntry[]) => void;
  
  /** Move to the next turn in combat */
  nextTurn: () => void;
  
  /** Move to the next round in combat */
  nextRound: () => void;
  
  /** Update an initiative entry */
  updateInitiativeEntry: (entityId: string, updates: Partial<InitiativeEntry>) => void;
  
  /** Add rewards to a combat */
  addRewards: (combatId: string, rewards: RewardItem[]) => Promise<Combat | null>;
}

export type CombatsSlice = CombatsState & CombatsActions;

export const createCombatsSlice: StateCreator<
  CombatsSlice,
  [],
  [],
  CombatsSlice
> = (set, get) => ({
  // Initial state
  combats: [],
  activeCombatId: null,
  initiativeOrder: [],
  currentRound: 1,
  currentTurnIndex: 0,
  isLoading: false,
  error: null,
  
  // Actions
  fetchCombats: async () => {
    try {
      set({ isLoading: true, error: null });
      const combatsData = await AssetManager.getDataObject<Combat[]>('combats.json');
      set({ 
        combats: combatsData || [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: `Failed to fetch combats: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false 
      });
    }
  },
  
  addCombat: async (combatData) => {
    try {
      set({ isLoading: true, error: null });
      
      const newCombat: Combat = {
        ...combatData,
        id: crypto.randomUUID(),
        status: combatData.status || 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedCombats = [...get().combats, newCombat];
      
      // Save to storage
      await AssetManager.saveDataObject('combats.json', updatedCombats);
      
      // Update state
      set({ 
        combats: updatedCombats,
        isLoading: false 
      });
      
      return newCombat;
    } catch (error) {
      set({ 
        error: `Failed to add combat: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateCombat: async (combatId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const combats = get().combats;
      const combatIndex = combats.findIndex(c => c.id === combatId);
      
      if (combatIndex === -1) {
        set({ 
          error: `Combat with ID ${combatId} not found`,
          isLoading: false 
        });
        return null;
      }
      
      const updatedCombat: Combat = {
        ...combats[combatIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const updatedCombats = [
        ...combats.slice(0, combatIndex),
        updatedCombat,
        ...combats.slice(combatIndex + 1)
      ];
      
      // Save to storage
      await AssetManager.saveDataObject('combats.json', updatedCombats);
      
      // Update state
      set({ 
        combats: updatedCombats,
        isLoading: false 
      });
      
      return updatedCombat;
    } catch (error) {
      set({ 
        error: `Failed to update combat: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteCombat: async (combatId) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedCombats = get().combats.filter(c => c.id !== combatId);
      
      // Save to storage
      await AssetManager.saveDataObject('combats.json', updatedCombats);
      
      // Update state
      set({ 
        combats: updatedCombats,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: `Failed to delete combat: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false 
      });
      return false;
    }
  },
  
  startCombatSession: async (combatId) => {
    try {
      const combat = get().combats.find(c => c.id === combatId);
      
      if (!combat) {
        set({ error: `Combat with ID ${combatId} not found` });
        return false;
      }
      
      // Update combat status
      await get().updateCombat(combatId, { 
        status: 'active',
        round: 1,
        turn: 0
      });
      
      set({ 
        activeCombatId: combatId,
        currentRound: 1,
        currentTurnIndex: 0,
        initiativeOrder: [] // Will be populated by setupInitiative
      });
      
      return true;
    } catch (error) {
      set({ 
        error: `Failed to start combat session: ${error instanceof Error ? error.message : String(error)}`,
      });
      return false;
    }
  },
  
  endCombatSession: () => {
    const { activeCombatId, updateCombat } = get();
    
    if (activeCombatId) {
      // Update the combat status to completed
      updateCombat(activeCombatId, { status: 'completed' })
        .catch(error => {
          console.error("Failed to update combat status:", error);
        });
    }
    
    set({
      activeCombatId: null,
      initiativeOrder: [],
      currentRound: 1,
      currentTurnIndex: 0
    });
  },
  
  setupInitiative: (entries) => {
    // Sort entries by initiative value (highest first)
    const sortedEntries = [...entries].sort((a, b) => b.initiative - a.initiative);
    set({ initiativeOrder: sortedEntries, currentTurnIndex: 0 });
  },
  
  nextTurn: () => {
    const { initiativeOrder, currentTurnIndex } = get();
    
    if (initiativeOrder.length === 0) return;
    
    const nextIndex = (currentTurnIndex + 1) % initiativeOrder.length;
    
    // If we've completed a full round, we'll be back at index 0
    if (nextIndex === 0) {
      get().nextRound();
    }
    
    set({ currentTurnIndex: nextIndex });
  },
  
  nextRound: () => {
    set(state => ({ currentRound: state.currentRound + 1 }));
  },
  
  updateInitiativeEntry: (entityId, updates) => {
    const { initiativeOrder } = get();
    
    const updatedOrder = initiativeOrder.map(entry => 
      entry.entityId === entityId ? { ...entry, ...updates } : entry
    );
    
    set({ initiativeOrder: updatedOrder });
  },
  
  addRewards: async (combatId, rewards) => {
    try {
      const combat = get().combats.find(c => c.id === combatId);
      
      if (!combat) {
        set({ error: `Combat with ID ${combatId} not found` });
        return null;
      }
      
      const existingRewards = combat.rewards || [];
      const updatedRewards = [...existingRewards, ...rewards];
      
      return await get().updateCombat(combatId, { rewards: updatedRewards });
    } catch (error) {
      set({ 
        error: `Failed to add rewards: ${error instanceof Error ? error.message : String(error)}`,
      });
      return null;
    }
  }
}); 