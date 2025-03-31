/**
 * Audio Feature
 * 
 * This module contains components and hooks for audio management throughout the application.
 * It provides components for selecting and playing audio tracks, as well as a panel for
 * controlling playback volume and active tracks.
 * 
 * @module features/audio
 */

// Export components
export { AudioTrackSelector } from './components/AudioTrackSelector';
export { AudioTrackPanel } from './components/AudioTrackPanel';

// Export hooks
export { useAudioPlayer } from './hooks/useAudioPlayer';

// Export store slice
export { createAudioSlice } from './store/audioSlice';
export type { AudioState, AudioTrack, ActiveTrack } from './store/audioSlice'; 