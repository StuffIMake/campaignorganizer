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
    stopAllTracks: stopAllTracksFromSlice, // Renamed alias
    stopTrack, // Correctly destructure stopTrack for individual stopping
    setVolume,
    setTrackVolume,
    toggleMuteTrack
  } = useStore();

  /**
   * Plays an audio track with options
   * @param url - The URL of the audio file
   * @param options - Optional settings for playback
   * @returns The ID of the played track
   */
  const play = useCallback((url: string, options?: { 
    replace?: boolean;
    locationId?: string; 
    loop?: boolean;
    name?: string; // We'll extract this separately and not pass it to playTrack
  }) => {
    const { name, ...playOptions } = options || {};
    return playTrack(url, {
      replace: playOptions?.replace || false,
      locationId: playOptions?.locationId || 'global',
      loop: playOptions?.loop || false
    });
  }, [playTrack]);

  /**
   * Stops all currently playing audio tracks
   */
  const stopAll = useCallback(() => {
    stopAllTracksFromSlice(); // Use the renamed alias
  }, [stopAllTracksFromSlice]); // Update dependency

  /**
   * Stops a specific audio track by ID
   * @param trackId - The ID of the track to stop
   */
  const stop = useCallback((trackId: string) => {
    stopTrack(trackId); // Call the correct stopTrack function
  }, [stopTrack]); // Update dependency

  /**
   * Sets the master volume for all audio
   * @param volume - Volume level between 0 and 1
   */
  const setMasterVolume = useCallback((volume: number) => {
    setVolume(Math.max(0, Math.min(1, volume)));
  }, [setVolume]);

  /**
   * Sets the volume for a specific track
   * @param trackId - The ID of the track
   * @param volume - Volume level between 0 and 1
   */
  const adjustTrackVolume = useCallback((trackId: string, volume: number) => {
    setTrackVolume(trackId, Math.max(0, Math.min(1, volume)));
  }, [setTrackVolume]);

  /**
   * Toggles the mute state of a specific track
   * @param trackId - The ID of the track to mute/unmute
   */
  const toggleMute = useCallback((trackId: string) => {
    toggleMuteTrack(trackId);
  }, [toggleMuteTrack]);

  return {
    tracks: audioTracks,
    activeTracks,
    play,
    stop,
    stopAll,
    setMasterVolume,
    adjustTrackVolume,
    toggleMute,
    addTrack: addAudioTrack
  };
}; 