import { useCallback } from 'react';
import { useStore } from '../../../store';

/**
 * Custom hook for managing audio playback throughout the application
 * 
 * This hook provides a simplified API for playing, stopping, and controlling audio tracks.
 * It wraps the audio slice functionality from the store, handling common operations and
 * validating input parameters. The hook manages track volume, mute state, and provides
 * access to active tracks.
 * 
 * @example
 * ```tsx
 * const { play, stop, activeTracks, toggleMute } = useAudioPlayer();
 * 
 * // Play an audio track with options
 * play('path/to/audio.mp3', { loop: true, locationId: 'tavern' });
 * 
 * // Stop a specific track
 * stop('track-id');
 * 
 * // Toggle mute for a track
 * toggleMute('track-id');
 * ```
 * 
 * @returns {Object} Object containing audio player state and methods
 */
export const useAudioPlayer = () => {
  const {
    audioTracks,
    activeTracks,
    addAudioTrack,
    playTrack,
    stopAllTracks: stopAllTracksFromSlice,
    stopTrack,
    stopTracksByLocationPrefix,
    setVolume,
    setTrackVolume,
    toggleMuteTrack
  } = useStore();

  /**
   * Plays an audio track with options.
   * Normalizes URL and calls the audioSlice.playTrack action.
   * @param url - The audio filename or path (e.g., 'track.mp3' or '/audio/track.mp3')
   * @param options - Playback options (replace, locationId, loop)
   */
  const play = useCallback((url: string, options?: { 
    replace?: boolean; 
    locationId?: string; 
    loop?: boolean;
    name?: string; // name is not used by slice but kept for compatibility if needed elsewhere
  }) => {
    // Normalize the URL format - extract just the filename
    let filename = url;
    if (url.includes('/')) {
      filename = url.split('/').pop() || '';
      // Ensure filename doesn't have potential path prefixes
      if (filename.includes('/')) { 
        filename = filename.substring(filename.lastIndexOf('/') + 1);
      }
    }
    
    // Always construct path as /audio/filename
    const formattedUrl = `/audio/${filename}`;
    
    console.log(`useAudioPlayer.play: Calling slice playTrack with url=${formattedUrl}, options=`, options);
    // Call the slice action directly
    playTrack(formattedUrl, options);

  }, [playTrack]); // Dependency is only the stable playTrack action from the store

  /**
   * Stops all currently playing audio tracks.
   */
  const stopAll = useCallback(() => {
    console.log('useAudioPlayer.stopAll: Calling slice stopAllTracks');
    stopAllTracksFromSlice();
  }, [stopAllTracksFromSlice]);

  /**
   * Stops a specific audio track by ID.
   * @param trackId - The ID of the track to stop
   */
  const stop = useCallback((trackId: string) => {
    console.log(`useAudioPlayer.stop: Calling slice stopTrack for id=${trackId}`);
    stopTrack(trackId);
  }, [stopTrack]);
  
  /**
   * Stops all tracks associated with a specific location prefix.
   * @param locationIdPrefix - The location ID prefix (e.g., 'loc-1', 'combat-abc')
   */
  const stopLocationTracks = useCallback((locationIdPrefix: string) => {
    console.log(`useAudioPlayer.stopLocationTracks: Calling slice stopTracksByLocationPrefix for prefix=${locationIdPrefix}`);
    // Call the new slice action
    stopTracksByLocationPrefix(locationIdPrefix);
  }, [stopTracksByLocationPrefix]); // Dependency is the stable action

  // --- Volume/Mute Wrappers (mostly pass-through) --- 
  const setMasterVolume = useCallback((volume: number) => {
    setVolume(Math.max(0, Math.min(1, volume)));
  }, [setVolume]);

  const adjustTrackVolume = useCallback((trackId: string, volume: number) => {
    setTrackVolume(trackId, Math.max(0, Math.min(1, volume)));
  }, [setTrackVolume]);

  const toggleMute = useCallback((trackId: string) => {
    toggleMuteTrack(trackId);
  }, [toggleMuteTrack]);

  // --- Return Values --- 
  return {
    // State (read-only view for components)
    tracks: audioTracks, 
    activeTracks, 
    
    // Actions (stable callbacks)
    play,
    stop,
    stopAll,
    stopLocationTracks,
    setMasterVolume,
    adjustTrackVolume,
    toggleMute,
    addTrack: addAudioTrack // Keep addTrack if needed
  };
}; 