/**
 * Sample test data for Playwright tests
 * 
 * This file contains predefined test data that can be used to populate
 * IndexedDB for testing purposes. Add more data as needed for your tests.
 */

// Sample campaign location data
export const sampleLocations = [
  {
    id: 'loc-1',
    name: 'Misty Forest',
    description: 'A dense forest shrouded in mist, home to ancient trees and mysterious creatures.',
    type: 'wilderness',
    parentLocationId: null,
    imageUrl: 'placeholder.png',
    imageFile: null,
    audioFile: null,
    notes: 'Players first encounter this location at the start of the campaign.'
  },
  {
    id: 'loc-2',
    name: 'Abandoned Watchtower',
    description: 'A crumbling stone watchtower that once guarded the forest edge.',
    type: 'structure',
    parentLocationId: 'loc-1',
    imageFile: null,
    audioFile: null,
    notes: 'Contains clues about the ancient civilization that once dwelled here.'
  },
  {
    id: 'loc-3',
    name: 'Hidden Cave',
    description: 'A concealed cave entrance behind a waterfall, leading to an underground network.',
    type: 'dungeon',
    parentLocationId: 'loc-1',
    imageFile: null,
    audioFile: null,
    notes: 'Monsters have made this their lair. Treasure can be found in the deepest chamber.'
  }
];

// Sample campaign character data
export const sampleCharacters = [
  {
    id: 'char-1',
    name: 'Elder Thorne',
    description: 'An ancient druid who protects the forest.',
    type: 'npc',
    stats: {
      strength: 12,
      dexterity: 14,
      constitution: 16,
      intelligence: 18,
      wisdom: 20,
      charisma: 15
    },
    items: [
      { id: 'item-1', name: 'Staff of the Forest', description: 'A wooden staff infused with nature magic.' }
    ],
    notes: 'Knows the secret history of the region and can guide the players.'
  },
  {
    id: 'char-2',
    name: 'Captain Blackthorn',
    description: 'Former guard captain, now turned bandit leader.',
    type: 'enemy',
    stats: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 12,
      wisdom: 10,
      charisma: 14
    },
    items: [
      { id: 'item-2', name: 'Enchanted Longsword', description: 'A sharp blade that glows faintly blue in darkness.' }
    ],
    notes: 'Main antagonist for the first part of the campaign.'
  }
];

// Add other test data as needed for your specific tests
// For example: maps, encounters, audio settings, etc. 