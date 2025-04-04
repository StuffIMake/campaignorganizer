/**
 * Test helper functions for common IndexedDB test scenarios
 */
import { sampleLocations, sampleCharacters } from './testData';

// Helper for setting up a complete campaign with all sample data
export async function setupFullCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: sampleLocations,
    characters: sampleCharacters
  });
}

// Helper for setting up an empty campaign
export async function setupEmptyCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: [],
    characters: []
  });
}

// Helper for setting up a campaign with only locations
export async function setupLocationsOnlyCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: sampleLocations
  });
}

// Helper for setting up a campaign with only characters
export async function setupCharactersOnlyCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    characters: sampleCharacters
  });
}

// Helper for setting up a minimal campaign with just one location
export async function setupSingleLocationCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    locations: [{
      id: 'test-loc-1',
      name: 'Test Dungeon',
      description: 'A test dungeon for simple test cases',
      type: 'dungeon',
      parentLocationId: null,
      imageFile: null,
      audioFile: null,
      notes: 'Used for minimal test scenarios'
    }]
  });
}

// Helper for setting up a minimal campaign with just one character
export async function setupSingleCharacterCampaign(withIndexedDB: Function) {
  await withIndexedDB({
    characters: [{
      id: 'test-char-1',
      name: 'Test NPC',
      description: 'A test NPC for simple test cases',
      type: 'npc',
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      items: [],
      notes: 'Used for minimal test scenarios'
    }]
  });
} 