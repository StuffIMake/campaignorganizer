import { renderHook, act } from '@testing-library/react-hooks';
import { useAudioPlayer } from './useAudioPlayer';
import { useStore } from '../../../store';

// Mock the Zustand store
jest.mock('../../../store', () => ({
  // Type explicitly as jest.Mock
  useStore: jest.fn() as jest.Mock
}));

describe('useAudioPlayer', () => {
  // Mock store methods
  const playTrackMock = jest.fn();
  const stopTrackMock = jest.fn();
  const stopIndividualTrackMock = jest.fn();
  const setVolumeMock = jest.fn();
  const setTrackVolumeMock = jest.fn();
  const toggleMuteTrackMock = jest.fn();
  const addAudioTrackMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock store values
    // Access the mocked function properly with typed cast
    const mockedUseStore = useStore as unknown as jest.Mock;
    mockedUseStore.mockImplementation(() => ({
      audioTracks: [{ id: '1', name: 'Test Track', url: 'test.mp3' }],
      activeTracks: [{ 
        id: '1', 
        name: 'Test Track', 
        volume: 0.7, 
        isMuted: false, 
        locationId: 'test', 
        loop: false,
        howl: {} 
      }],
      playTrack: playTrackMock,
      stopTrack: stopTrackMock,
      stopIndividualTrack: stopIndividualTrackMock,
      setVolume: setVolumeMock,
      setTrackVolume: setTrackVolumeMock,
      toggleMuteTrack: toggleMuteTrackMock,
      addAudioTrack: addAudioTrackMock
    }));
  });

  it('should return audio player methods and state', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    expect(result.current).toHaveProperty('tracks');
    expect(result.current).toHaveProperty('activeTracks');
    expect(result.current).toHaveProperty('play');
    expect(result.current).toHaveProperty('stop');
    expect(result.current).toHaveProperty('stopAll');
    expect(result.current).toHaveProperty('setMasterVolume');
    expect(result.current).toHaveProperty('adjustTrackVolume');
    expect(result.current).toHaveProperty('toggleMute');
    expect(result.current).toHaveProperty('addTrack');
  });

  it('should call playTrack with the correct parameters', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    act(() => {
      result.current.play('test.mp3', { 
        loop: true, 
        replace: true, 
        locationId: 'test-location',
        name: 'Custom Name'
      });
    });
    
    expect(playTrackMock).toHaveBeenCalledWith('test.mp3', {
      loop: true,
      replace: true,
      locationId: 'test-location'
    });
  });

  it('should call stopTrack when stopping all tracks', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    act(() => {
      result.current.stopAll();
    });
    
    expect(stopTrackMock).toHaveBeenCalled();
  });

  it('should call stopIndividualTrack with the correct ID', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    act(() => {
      result.current.stop('track-123');
    });
    
    expect(stopIndividualTrackMock).toHaveBeenCalledWith('track-123');
  });

  it('should call setVolume with clamped values', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    // Test with normal value
    act(() => {
      result.current.setMasterVolume(0.5);
    });
    expect(setVolumeMock).toHaveBeenCalledWith(0.5);
    
    // Test with too high value
    act(() => {
      result.current.setMasterVolume(1.5);
    });
    expect(setVolumeMock).toHaveBeenCalledWith(1);
    
    // Test with too low value
    act(() => {
      result.current.setMasterVolume(-0.5);
    });
    expect(setVolumeMock).toHaveBeenCalledWith(0);
  });

  it('should call setTrackVolume with clamped values', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    // Test with normal value
    act(() => {
      result.current.adjustTrackVolume('track-123', 0.5);
    });
    expect(setTrackVolumeMock).toHaveBeenCalledWith('track-123', 0.5);
    
    // Test with too high value
    act(() => {
      result.current.adjustTrackVolume('track-123', 1.5);
    });
    expect(setTrackVolumeMock).toHaveBeenCalledWith('track-123', 1);
    
    // Test with too low value
    act(() => {
      result.current.adjustTrackVolume('track-123', -0.5);
    });
    expect(setTrackVolumeMock).toHaveBeenCalledWith('track-123', 0);
  });

  it('should call toggleMuteTrack with the correct ID', () => {
    const { result } = renderHook(() => useAudioPlayer());
    
    act(() => {
      result.current.toggleMute('track-123');
    });
    
    expect(toggleMuteTrackMock).toHaveBeenCalledWith('track-123');
  });

  it('should call addAudioTrack with the provided track', () => {
    const { result } = renderHook(() => useAudioPlayer());
    const track = { name: 'New Track', url: 'new.mp3' };
    
    act(() => {
      result.current.addTrack(track);
    });
    
    expect(addAudioTrackMock).toHaveBeenCalledWith(track);
  });
}); 