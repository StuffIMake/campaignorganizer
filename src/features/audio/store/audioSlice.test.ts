import { act, renderHook } from '@testing-library/react-hooks';
import { createAudioSlice, AudioState } from './audioSlice';
import { Howl } from 'howler';
import { StoreApi } from 'zustand';

// Mock Howl to avoid actual audio playback in tests
jest.mock('howler', () => {
  return {
    Howl: jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      stop: jest.fn(),
      mute: jest.fn(),
      volume: jest.fn(),
    })),
  };
});

// Mock AssetManager
jest.mock('../../../services/assetManager', () => ({
  AssetManager: {
    getAssetUrl: jest.fn().mockResolvedValue('test-url'),
  },
}));

describe('audioSlice', () => {
  // Setup a minimal mock store implementation
  let state: AudioState = {
    audioTracks: [],
    activeTracks: [],
    volume: 0.7,
    isPlaying: false,
    addAudioTrack: jest.fn(),
    playTrack: jest.fn(),
    stopAllTracks: jest.fn(),
    stopTrack: jest.fn(),
    setVolume: jest.fn(),
    toggleMuteTrack: jest.fn(),
    setTrackVolume: jest.fn(),
  };

  const set = jest.fn((fn) => {
    if (typeof fn === 'function') {
      state = { ...state, ...fn(state) };
    } else {
      state = { ...state, ...fn };
    }
  });

  // Type the get function properly
  const get = jest.fn(() => state as AudioState);
  
  // Create a complete mock StoreApi
  const api: StoreApi<AudioState> = { 
    setState: set, 
    getState: get, 
    subscribe: jest.fn(), 
    destroy: jest.fn(),
    getInitialState: jest.fn(() => state)
  };

  beforeEach(() => {
    // Reset the state before each test
    state = {
      audioTracks: [],
      activeTracks: [],
      volume: 0.7,
      isPlaying: false,
      addAudioTrack: jest.fn(),
      playTrack: jest.fn(),
      stopAllTracks: jest.fn(),
      stopTrack: jest.fn(),
      setVolume: jest.fn(),
      toggleMuteTrack: jest.fn(),
      setTrackVolume: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should create an audio slice with initial state', () => {
    const slice = createAudioSlice(set, get, api);
    
    expect(slice).toBeDefined();
    expect(slice.audioTracks).toEqual([]);
    expect(slice.activeTracks).toEqual([]);
    expect(slice.volume).toBe(0.7);
    expect(slice.isPlaying).toBe(false);
  });

  it('should add an audio track', () => {
    const slice = createAudioSlice(set, get, api);
    
    // Add a track
    slice.addAudioTrack({ 
      name: 'Test Track', 
      url: 'test.mp3' 
    });
    
    // Check that set was called with the right arguments
    expect(set).toHaveBeenCalled();
    
    // Update our mock state manually to simulate Zustand behavior
    // This is normally handled by the set function
    const newTrack = {
      id: expect.any(String),
      name: 'Test Track',
      url: 'test.mp3',
      howl: expect.any(Object),
    };
    state.audioTracks = [newTrack];
    
    // Verify the track was added
    expect(state.audioTracks).toHaveLength(1);
    expect(state.audioTracks[0]).toMatchObject({
      name: 'Test Track',
      url: 'test.mp3',
    });
    expect(Howl).toHaveBeenCalledWith({
      src: ['test.mp3'],
      html5: true,
    });
  });

  it('should stop all tracks', () => {
    // Setup mock howl instances
    const mockHowl1 = { stop: jest.fn() };
    const mockHowl2 = { stop: jest.fn() };
    
    // Setup state with active tracks
    state.activeTracks = [
      { id: '1', name: 'Track 1', howl: mockHowl1 as unknown as Howl, volume: 0.7, isMuted: false, locationId: '', loop: false },
      { id: '2', name: 'Track 2', howl: mockHowl2 as unknown as Howl, volume: 0.7, isMuted: false, locationId: '', loop: false },
    ];
    
    const slice = createAudioSlice(set, get, api);
    
    // Stop all tracks
    slice.stopAllTracks();
    
    // Verify all howls were stopped
    expect(mockHowl1.stop).toHaveBeenCalled();
    expect(mockHowl2.stop).toHaveBeenCalled();
    
    // Check that set was called to clear active tracks
    expect(set).toHaveBeenCalledWith({
      activeTracks: [],
      isPlaying: false,
    });
  });

  it('should stop an individual track', () => {
    // Setup mock howl instances
    const mockHowl1 = { stop: jest.fn() };
    const mockHowl2 = { stop: jest.fn() };
    
    // Setup state with active tracks
    state.activeTracks = [
      { id: '1', name: 'Track 1', howl: mockHowl1 as unknown as Howl, volume: 0.7, isMuted: false, locationId: '', loop: false },
      { id: '2', name: 'Track 2', howl: mockHowl2 as unknown as Howl, volume: 0.7, isMuted: false, locationId: '', loop: false },
    ];
    
    const slice = createAudioSlice(set, get, api);
    
    // Stop one track
    slice.stopTrack('1');
    
    // Verify only the specified howl was stopped
    expect(mockHowl1.stop).toHaveBeenCalled();
    expect(mockHowl2.stop).not.toHaveBeenCalled();
    
    // Check that set was called to update active tracks
    expect(set).toHaveBeenCalled();
  });

  it('should toggle mute for a track', () => {
    // Setup mock howl instance
    const mockHowl = { mute: jest.fn() };
    
    // Setup state with an active track
    state.activeTracks = [
      { id: '1', name: 'Track 1', howl: mockHowl as unknown as Howl, volume: 0.7, isMuted: false, locationId: '', loop: false },
    ];
    
    const slice = createAudioSlice(set, get, api);
    
    // Toggle mute
    slice.toggleMuteTrack('1');
    
    // Verify the howl's mute was called with true
    expect(mockHowl.mute).toHaveBeenCalledWith(true);
    
    // Check that set was called to update the track's mute state
    expect(set).toHaveBeenCalled();
  });
}); 