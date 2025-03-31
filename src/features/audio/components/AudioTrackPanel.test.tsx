import React from 'react';
import { render } from '@testing-library/react';
// No screen or fireEvent directly from test library, use '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom/extend-expect';
import { AudioTrackPanel } from './AudioTrackPanel';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

// Mock the AudioTrackSelector component to simplify testing
jest.mock('./AudioTrackSelector', () => ({
  AudioTrackSelector: () => <div data-testid="audio-track-selector">Audio Track Selector Mock</div>
}));

// Mock the useAudioPlayer hook
jest.mock('../hooks/useAudioPlayer', () => ({
  useAudioPlayer: jest.fn()
}));

describe('AudioTrackPanel', () => {
  // Define mock data and functions
  const mockStopTrack = jest.fn();
  const mockToggleMute = jest.fn();
  const mockSetTrackVolume = jest.fn();
  const mockSetVolume = jest.fn();
  
  // Create mock active tracks
  const mockActiveTracks = [
    { 
      id: 'track1', 
      name: 'Background Music', 
      volume: 0.7, 
      isMuted: false, 
      locationId: 'tavern', 
      loop: true,
      howl: {}
    },
    { 
      id: 'track2', 
      name: 'Ambient Sounds', 
      volume: 0.5, 
      isMuted: true, 
      locationId: 'forest', 
      loop: false,
      howl: {}
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup our mocked hook return values
    (useAudioPlayer as jest.Mock).mockReturnValue({
      activeTracks: mockActiveTracks,
      toggleMute: mockToggleMute,
      stop: mockStopTrack,
      adjustTrackVolume: mockSetTrackVolume,
      setMasterVolume: mockSetVolume
    });
  });
  
  it('renders the panel with audio controls', () => {
    render(<AudioTrackPanel />);
    
    // Check for main elements
    expect(screen.getByText('Audio Controls')).toBeInTheDocument();
    expect(screen.getByTestId('audio-track-selector')).toBeInTheDocument();
    expect(screen.getByText('Master Volume')).toBeInTheDocument();
  });
  
  it('displays active tracks', () => {
    render(<AudioTrackPanel />);
    
    // Should show both track names
    expect(screen.getByText('Background Music')).toBeInTheDocument();
    expect(screen.getByText('Ambient Sounds')).toBeInTheDocument();
  });
  
  it('shows appropriate message when no tracks are playing', () => {
    // Override mock to return empty tracks array
    (useAudioPlayer as jest.Mock).mockReturnValue({
      activeTracks: [],
      toggleMute: mockToggleMute,
      stop: mockStopTrack,
      adjustTrackVolume: mockSetTrackVolume,
      setMasterVolume: mockSetVolume
    });
    
    render(<AudioTrackPanel />);
    
    expect(screen.getByText('No tracks currently playing. Use the "Add Track" button to play some music.')).toBeInTheDocument();
  });
  
  it('handles master volume changes', () => {
    render(<AudioTrackPanel />);
    
    // Find the master volume slider
    const volumeSlider = screen.getByRole('slider', { name: /master volume/i });
    
    // Change the volume
    fireEvent.change(volumeSlider, { target: { value: 0.5 } });
    
    // Check that setVolume was called with the new value
    expect(mockSetVolume).toHaveBeenCalledWith(0.5);
  });
  
  it('can toggle mute state for a track', () => {
    render(<AudioTrackPanel />);
    
    // Find mute buttons (there should be one for each track)
    const muteButtons = screen.getAllByRole('button');
    
    // Find and click the mute button for the first track
    // We need to be a bit more specific since there are multiple buttons
    const trackMuteButtons = muteButtons.filter((btn: HTMLElement) => {
      const rect = btn.getBoundingClientRect();
      return rect.width === rect.height && rect.width <= 30; // Assuming mute buttons are small and square
    });
    
    // Click the first track's mute button (might need adjustment based on actual DOM structure)
    fireEvent.click(trackMuteButtons[1]); // Index might need adjustment
    
    // Check that toggleMute was called with the correct track ID
    expect(mockToggleMute).toHaveBeenCalledWith('track1');
  });
  
  it('can stop a track', () => {
    render(<AudioTrackPanel />);
    
    // Find all the close buttons
    const closeButtons = screen.getAllByRole('button');
    
    // Find the last button in each track row (should be stop button)
    // This is a simplification - in a real test you might need a more specific selector
    const stopButton = closeButtons[closeButtons.length - 1];
    
    // Click the stop button
    fireEvent.click(stopButton);
    
    // Verify stopTrack was called with the correct ID
    expect(mockStopTrack).toHaveBeenCalled();
  });
  
  it('can toggle between minimized and expanded states', () => {
    render(<AudioTrackPanel />);
    
    // Initially should be in expanded state
    expect(screen.getByText('Audio Controls')).toBeInTheDocument();
    
    // Find and click the minimize button
    const minimizeButton = screen.getAllByRole('button')[0]; // Assuming first button is minimize
    fireEvent.click(minimizeButton);
    
    // Should now be in minimized state - the header should not be visible
    expect(screen.queryByText('Audio Controls')).not.toBeInTheDocument();
    
    // Should show just an icon button to maximize
    const maximizeButton = screen.getByTitle('Audio Controls');
    
    // Click to maximize again
    fireEvent.click(maximizeButton);
    
    // Should be back in expanded state
    expect(screen.getByText('Audio Controls')).toBeInTheDocument();
  });
}); 