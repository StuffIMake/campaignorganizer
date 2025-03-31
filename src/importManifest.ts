/**
 * This file is used to pre-cache important lazy-loaded modules
 * to avoid "Failed to fetch dynamically imported module" errors.
 */
export function preloadRouteComponents(): void {
  // Pre-cache these important route components by importing them
  // but don't actually wait for them to load
  import('./features/map/views/MapView');
  import('./features/locations/views/LocationsView');
  import('./features/characters/views/CharactersView');
  import('./features/combats/views/CombatsView');
  import('./features/combats/views/CombatSessionView');
  
  console.log('Preloading critical components...');
} 