/**
 * @file audioSlice.ts
 * @description Store slice for managing audio playback and tracks
 */

import { StateCreator } from 'zustand';
import { Howl } from 'howler';
import { AssetManager } from '../../../services/assetManager';
import { generateUUID } from '../../../utils/uuid';

/**
 * Represents an audio track that can be played
 */
export interface AudioTrack {
  /** Unique identifier for the track */
  id: string;
  
  /** Display name of the track */
  name: string;
  
  /** URL or path to the audio file */
  url: string;
  
  /** Optional Howl instance for the track */
  howl?: Howl;
}

/**
 * Represents an active (currently playing) audio track
 */
export interface ActiveTrack {
  /** Unique identifier for the track */
  id: string;
  
  /** Howl instance for the track */
  howl: Howl;
  
  /** Display name of the track */
  name: string;
  
  /** Volume level (0.0 - 1.0) */
  volume: number;
  
  /** Whether the track is currently muted */
  isMuted: boolean;
  
  /** ID of the location this track is associated with ('' for global) */
  locationId: string;
  
  /** Whether the track should loop */
  loop: boolean;
}

/**
 * State and actions for audio management
 */
export interface AudioState {
  /** List of available audio tracks */
  audioTracks: AudioTrack[];
  
  /** List of currently playing tracks */
  activeTracks: ActiveTrack[];
  
  /** Master volume (0.0 - 1.0) */
  volume: number;
  
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Add a new audio track to the list */
  addAudioTrack: (track: Omit<AudioTrack, 'id'>) => void;
  
  /** Play an audio track */
  playTrack: (url: string, options?: { 
    replace?: boolean, 
    locationId?: string, 
    loop?: boolean 
  }) => Promise<void>;
  
  /** Stop all playing tracks */
  stopAllTracks: () => void;
  
  /** Stop a specific track by ID */
  stopTrack: (trackId: string) => void;
  
  /** Set the master volume */
  setVolume: (volume: number) => void;
  
  /** Toggle mute status for a specific track */
  toggleMuteTrack: (trackId: string) => void;
  
  /** Set volume for a specific track */
  setTrackVolume: (trackId: string, volume: number) => void;
}

/**
 * Create the audio slice for the Zustand store
 */
export const createAudioSlice: StateCreator<
  AudioState,
  [],
  [],
  AudioState
> = (set, get) => ({
  audioTracks: [],
  activeTracks: [],
  volume: 0.7,
  isPlaying: false,
  
  addAudioTrack: (track) => {
    const newTrack = {
      ...track,
      id: generateUUID(),
      howl: new Howl({ src: [track.url], html5: true }),
    };
    set((state) => ({
      audioTracks: [...state.audioTracks, newTrack],
    }));
  },
  
  playTrack: async (url, options = {}) => {
    try {
      const { replace = true, locationId = '', loop = false } = options;
      
      // Format the URL if needed
      const formattedUrl = url.startsWith('/') 
        ? url.substring(1) // Remove leading slash
        : url;
      
      // Extract asset name from the URL
      let assetName = formattedUrl;
      if (formattedUrl.includes('/')) {
        assetName = formattedUrl.split('/').pop() || '';
      }
      
      // Check if we already have this track playing (with the same locationId)
      const existingTrack = get().activeTracks.find(
        track => track.name === assetName && track.locationId === locationId
      );
      
      if (existingTrack) {
        // If the track is already playing, just make sure it's not muted
        if (existingTrack.isMuted) {
          set((state) => ({
            activeTracks: state.activeTracks.map(track => 
              track.id === existingTrack.id 
                ? { ...track, isMuted: false } 
                : track
            )
          }));
          existingTrack.howl.mute(false);
        }
        return;
      }
      
      // If replace is true, stop all tracks with the same locationId
      if (replace) {
        const tracksToStop = get().activeTracks.filter(
          track => track.locationId === locationId
        );
        
        // Stop those tracks
        tracksToStop.forEach(track => {
          track.howl.stop();
        });
        
        // Remove them from the active tracks
        set((state) => ({
          activeTracks: state.activeTracks.filter(
            track => track.locationId !== locationId || track.locationId === ''
          ),
        }));
      }
      
      // Get the audio file URL from AssetManager
      const assetType = formattedUrl.startsWith('audio/') ? 'audio' : '';
      const assetNameOnly = assetName.replace(/^audio\//, '');
      
      // Try to get the asset URL - might not be in the format we expect
      let audioUrl = '';
      try {
        audioUrl = await AssetManager.getAssetUrl(
          assetType || 'audio', 
          assetNameOnly
        );
      } catch (error) {
        console.error('Error getting asset URL:', error);
        // Fallback to trying the URL directly
        audioUrl = formattedUrl;
      }
      
      if (!audioUrl) {
        console.error(`Could not find audio track: ${assetName}`);
        return;
      }
      
      // Create a new Howl instance
      const howl = new Howl({
        src: [audioUrl],
        loop: loop,
        volume: get().volume,
        html5: true,
      });
      
      // Create a new active track
      const newTrack: ActiveTrack = {
        id: generateUUID(),
        howl,
        name: assetName,
        volume: get().volume,
        isMuted: false,
        locationId,
        loop,
      };
      
      // Add to active tracks
      set((state) => ({
        activeTracks: [...state.activeTracks, newTrack],
        isPlaying: true,
      }));
      
      // Play the track
      howl.play();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  },
  
  stopAllTracks: () => {
    // Stop all Howl instances
    get().activeTracks.forEach(track => {
      track.howl.stop();
    });
    
    // Clear active tracks
    set({ 
      activeTracks: [],
      isPlaying: false
    });
  },
  
  stopTrack: (trackId) => {
    // Find the track
    const track = get().activeTracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Stop the Howl instance
    track.howl.stop();
    
    // Remove from active tracks
    set((state) => ({
      activeTracks: state.activeTracks.filter(t => t.id !== trackId),
      isPlaying: state.activeTracks.length > 1, // Only false if this was the last track
    }));
  },
  
  setVolume: (volume) => {
    // Update all active Howl instances
    get().activeTracks.forEach(track => {
      if (!track.isMuted) {
        track.howl.volume(volume);
      }
    });
    
    // Update volume state
    set({ volume });
  },
  
  toggleMuteTrack: (trackId) => {
    const activeTracks = get().activeTracks;
    const trackIndex = activeTracks.findIndex(track => track.id === trackId);
    
    if (trackIndex === -1) return;
    
    const track = activeTracks[trackIndex];
    const newMuteState = !track.isMuted;
    
    // Update the Howl instance
    track.howl.mute(newMuteState);
    
    // Update the track in state
    set((state) => ({
      activeTracks: state.activeTracks.map(t => 
        t.id === trackId 
          ? { ...t, isMuted: newMuteState } 
          : t
      )
    }));
  },
  
  setTrackVolume: (trackId, volume) => {
    const track = get().activeTracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Update the Howl instance if not muted
    if (!track.isMuted) {
      track.howl.volume(volume);
    }
    
    // Update the track in state
    set((state) => ({
      activeTracks: state.activeTracks.map(t => 
        t.id === trackId 
          ? { ...t, volume } 
          : t
      )
    }));
  }
}); 