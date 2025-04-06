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

  /** Tracks which combat IDs have already had audio initialized to prevent duplicate initialization */
  initializedCombatAudio: Record<string, boolean>;
  
  /** Add a new audio track to the list */
  addAudioTrack: (track: Omit<AudioTrack, 'id'>) => void;
  
  /** 
   * Play an audio track. Handles replacement and prevents duplicates.
   * @param url - The path to the audio file (e.g., /audio/track.mp3)
   * @param options - Playback options
   * @param options.replace - If true, stop other tracks with the same locationId. Defaults to true.
   * @param options.locationId - ID to group tracks (e.g., location ID, combat ID, 'global').
   * @param options.loop - Whether the track should loop.
   */
  playTrack: (url: string, options?: { 
    replace?: boolean, 
    locationId?: string, 
    loop?: boolean 
  }) => Promise<void>;
  
  /** Stop all playing tracks */
  stopAllTracks: () => void;
  
  /** Stop a specific track by ID */
  stopTrack: (trackId: string) => void;

  /** Stop all tracks matching a locationId prefix */
  stopTracksByLocationPrefix: (prefix: string) => void;
  
  /** Set the master volume */
  setVolume: (volume: number) => void;
  
  /** Toggle mute status for a specific track */
  toggleMuteTrack: (trackId: string) => void;
  
  /** Set volume for a specific track */
  setTrackVolume: (trackId: string, volume: number) => void;

  /** Mark a combat as having audio initialized to prevent repeated initialization */
  markCombatAudioInitialized: (combatId: string) => void;
  
  /** Check if combat audio has been initialized for the given ID */
  isCombatAudioInitialized: (combatId: string) => boolean;
  
  /** Reset combat audio initialization status for a combat (used when leaving combat) */
  resetCombatAudioInitialized: (combatId: string) => void;
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
  initializedCombatAudio: {},
  
  addAudioTrack: (track) => {
    // This seems fine, but ensures howl isn't created unnecessarily if already present
    const existing = get().audioTracks.find(t => t.url === track.url);
    if (existing) return; // Don't add duplicates

    const newTrack = {
      ...track,
      id: generateUUID(),
      // Howl creation can be deferred until playTrack if needed, but this is okay for now
      howl: new Howl({ src: [track.url], html5: true }), 
    };
    set((state) => ({ audioTracks: [...state.audioTracks, newTrack] }));
  },
  
  playTrack: async (url, options = {}) => {
    // Default replace to true if not specified
    const { replace = true, locationId = 'global', loop = false } = options;
    console.log(`audioSlice.playTrack: Called with url=${url}, replace=${replace}, locationId=${locationId}, loop=${loop}`);

    let assetName = url;
    if (url.includes('/')) {
      assetName = url.split('/').pop() || '';
    }
    if (!assetName) {
        console.error('audioSlice.playTrack: Invalid URL, could not extract asset name:', url);
        return;
    }

    const currentActiveTracks = get().activeTracks;

    // --- Duplicate Check --- 
    // Check if the *exact same track* is already playing at the *exact same locationId*
    const duplicateTrack = currentActiveTracks.find(
      track => track.name === assetName && track.locationId === locationId
    );

    if (duplicateTrack) {
      console.log(`audioSlice.playTrack: Track ${assetName} already playing at ${locationId}. Ensuring unmuted.`);
      // If found, just ensure it's unmuted and return
      if (duplicateTrack.isMuted) {
        duplicateTrack.howl.mute(false);
        set(state => ({
          activeTracks: state.activeTracks.map(t => 
            t.id === duplicateTrack.id ? { ...t, isMuted: false } : t
          )
        }));
      }
      return; // Do not proceed to play again
    }

    // --- Replacement Logic --- 
    let tracksToStop: ActiveTrack[] = [];
    let remainingTracks: ActiveTrack[] = [...currentActiveTracks];

    if (replace && locationId !== 'global') { // Only replace if flag is true and not global
        console.log(`audioSlice.playTrack: Replace=true. Checking for tracks with locationId=${locationId} to stop.`);
        tracksToStop = currentActiveTracks.filter(track => track.locationId === locationId);
        if (tracksToStop.length > 0) {
            console.log(`audioSlice.playTrack: Found ${tracksToStop.length} tracks to stop.`);
            remainingTracks = currentActiveTracks.filter(track => track.locationId !== locationId);
        }
    }

    // Stop the necessary tracks
    if (tracksToStop.length > 0) {
        tracksToStop.forEach(track => {
            console.log(`audioSlice.playTrack: Stopping track ${track.name} (id: ${track.id})`);
            track.howl.stop();
            // Optional: Fade out? track.howl.fade(track.howl.volume(), 0, 500).once('fade', () => track.howl.stop());
        });
        // Update state immediately to remove stopped tracks
        set({ activeTracks: remainingTracks });
    }

    // --- Play New Track --- 
    try {
      console.log(`audioSlice.playTrack: Attempting to get asset URL for name: ${assetName}`);
      // Use AssetManager to get the actual playable URL (handles base64 etc.)
      const audioUrl = await AssetManager.getAssetUrl('audio', assetName);
      if (!audioUrl) {
        console.error(`audioSlice.playTrack: AssetManager failed to find URL for: ${assetName}`);
        return;
      }

      console.log(`audioSlice.playTrack: Creating and playing new Howl for ${assetName} at ${locationId}`);
      const howl = new Howl({
        src: [audioUrl],
        loop: loop,
        volume: get().volume, // Use current master volume
        html5: true, // Recommended for broader compatibility
        // Optional: Add event listeners for debugging
        // onload: () => console.log(`Howl loaded: ${assetName}`),
        // onloaderror: (id, err) => console.error(`Howl load error: ${assetName}`, err),
        // onplayerror: (id, err) => console.error(`Howl play error: ${assetName}`, err),
        // onplay: () => console.log(`Howl playing: ${assetName}`),
        // onend: () => console.log(`Howl ended: ${assetName}`),
      });

      const newTrack: ActiveTrack = {
        id: generateUUID(),
        howl,
        name: assetName,
        volume: get().volume,
        isMuted: false,
        locationId,
        loop,
      };

      // Add the new track to the list (which already contains only the non-replaced tracks)
      set(state => ({
        activeTracks: [...state.activeTracks, newTrack],
        isPlaying: true, 
      }));

      howl.play();

    } catch (error) {
      console.error(`audioSlice.playTrack: Error during Howl creation/play for ${assetName}:`, error);
    }
  },
  
  stopAllTracks: () => {
    console.log('audioSlice.stopAllTracks: Stopping all tracks');
    const currentActiveTracks = get().activeTracks;
    currentActiveTracks.forEach(track => {
      track.howl.stop();
    });
    set({ activeTracks: [], isPlaying: false });
  },
  
  stopTrack: (trackId) => {
    const currentActiveTracks = get().activeTracks;
    const track = currentActiveTracks.find(t => t.id === trackId);
    if (!track) {
        console.log(`audioSlice.stopTrack: Track ${trackId} not found.`);
        return;
    }
    
    console.log(`audioSlice.stopTrack: Stopping track ${track.name} (id: ${trackId})`);
    track.howl.stop();
    
    const remainingTracks = currentActiveTracks.filter(t => t.id !== trackId);
    set({
      activeTracks: remainingTracks,
      isPlaying: remainingTracks.length > 0,
    });
  },

  stopTracksByLocationPrefix: (prefix: string) => {
    if (!prefix) return;
    console.log(`audioSlice.stopTracksByLocationPrefix: Stopping tracks with prefix: ${prefix}`);
    const currentActiveTracks = get().activeTracks;
    const tracksToStop = currentActiveTracks.filter(
      track => track.locationId && track.locationId.startsWith(prefix)
    );
    const remainingTracks = currentActiveTracks.filter(
        track => !track.locationId || !track.locationId.startsWith(prefix)
      );

    if (tracksToStop.length > 0) {
        tracksToStop.forEach(track => {
            console.log(`Stopping track ${track.name} (locId: ${track.locationId})`);
            track.howl.stop();
        });
        set({ 
            activeTracks: remainingTracks,
            isPlaying: remainingTracks.length > 0
        });
    } else {
        console.log(`No tracks found with prefix: ${prefix}`);
    }
  },
  
  setVolume: (volume) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    console.log(`audioSlice.setVolume: Setting master volume to ${newVolume}`);
    get().activeTracks.forEach(track => {
      // Update Howl instance only if not individually muted by toggleMuteTrack
      if (!track.isMuted) { 
        track.howl.volume(newVolume);
      }
    });
    set({ volume: newVolume });
  },
  
  toggleMuteTrack: (trackId) => {
    const track = get().activeTracks.find(t => t.id === trackId);
    if (!track) return;
    const newMuteState = !track.isMuted;
    console.log(`audioSlice.toggleMuteTrack: Toggling mute for ${track.name} to ${newMuteState}`);
    track.howl.mute(newMuteState);
    set(state => ({
      activeTracks: state.activeTracks.map(t => 
        t.id === trackId ? { ...t, isMuted: newMuteState } : t
      )
    }));
  },
  
  setTrackVolume: (trackId, volume) => {
    const track = get().activeTracks.find(t => t.id === trackId);
    if (!track) return;
    const newVolume = Math.max(0, Math.min(1, volume));
    console.log(`audioSlice.setTrackVolume: Setting volume for ${track.name} to ${newVolume}`);
    // Update Howl instance only if not muted
    if (!track.isMuted) {
      track.howl.volume(newVolume);
    }
    set(state => ({
      activeTracks: state.activeTracks.map(t => 
        t.id === trackId ? { ...t, volume: newVolume } : t // Store the individual volume
      )
    }));
  },

  markCombatAudioInitialized: (combatId) => {
    console.log(`audioSlice.markCombatAudioInitialized: Marking combat ${combatId} as initialized`);
    set(state => ({
      initializedCombatAudio: {
        ...state.initializedCombatAudio,
        [combatId]: true
      }
    }));
  },
  
  isCombatAudioInitialized: (combatId) => {
    return Boolean(get().initializedCombatAudio[combatId]);
  },
  
  resetCombatAudioInitialized: (combatId) => {
    console.log(`audioSlice.resetCombatAudioInitialized: Resetting combat ${combatId} initialization status`);
    set(state => {
      const { [combatId]: _, ...rest } = state.initializedCombatAudio;
      return { initializedCombatAudio: rest };
    });
  },
}); 