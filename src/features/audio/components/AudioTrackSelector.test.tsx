import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { AudioTrackSelector } from './AudioTrackSelector';
import { AssetManager } from '../../../services/assetManager';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

// Mock the AssetManager
jest.mock('../../../services/assetManager', () => ({
  AssetManager: {
    getAssets: jest.fn()
  }
}));

// Mock the useAudioPlayer hook
jest.mock('../hooks/useAudioPlayer', () => ({
  useAudioPlayer: jest.fn()
}));

describe('AudioTrackSelector', () => {
  // Setup defaults for our mocks
  const mockPlay = jest.fn();
  const mockActiveTracks = [{ id: '1', name: 'test-track.mp3' }];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup our mocked hook return values
    (useAudioPlayer as jest.Mock).mockReturnValue({
      play: mockPlay,
      activeTracks: mockActiveTracks
    });
    
    // Setup our mocked AssetManager return values 
    (AssetManager.getAssets as jest.Mock).mockResolvedValue([
      { name: 'test-track.mp3' },
      { name: 'another-track.mp3' }
    ]);
  });
  
  it('renders the Add Track button', () => {
    render(<AudioTrackSelector />);
    
    expect(screen.getByText('Add Track')).toBeInTheDocument();
  });
  
  it('opens a dialog when the Add Track button is clicked', () => {
    render(<AudioTrackSelector />);
    
    // Click the Add Track button
    fireEvent.click(screen.getByText('Add Track'));
    
    // Dialog should be visible
    expect(screen.getByText('Select Audio Track')).toBeInTheDocument();
    expect(screen.getByText('Select a track to play. You can choose whether to loop it or play it once.')).toBeInTheDocument();
  });
  
  it('loads audio assets when the dialog opens', async () => {
    render(<AudioTrackSelector />);
    
    // Click the Add Track button
    fireEvent.click(screen.getByText('Add Track'));
    
    // Verify AssetManager.getAssets was called with 'audio'
    expect(AssetManager.getAssets).toHaveBeenCalledWith('audio');
    
    // Wait for assets to load
    await waitFor(() => {
      expect(screen.getByText('test-track.mp3')).toBeInTheDocument();
      expect(screen.getByText('another-track.mp3')).toBeInTheDocument();
    });
  });
  
  it('filters audio assets based on search input', async () => {
    render(<AudioTrackSelector />);
    
    // Click the Add Track button
    fireEvent.click(screen.getByText('Add Track'));
    
    // Wait for assets to load
    await waitFor(() => {
      expect(screen.getByText('test-track.mp3')).toBeInTheDocument();
    });
    
    // Enter search term
    fireEvent.change(screen.getByPlaceholderText('Search tracks...'), { target: { value: 'another' } });
    
    // The filtered track should be visible, but the other should be hidden
    expect(screen.getByText('another-track.mp3')).toBeInTheDocument();
    expect(screen.queryByText('test-track.mp3')).not.toBeInTheDocument();
  });
  
  it('plays a track when clicked', async () => {
    // Setup mock to indicate test-track is NOT already playing
    (useAudioPlayer as jest.Mock).mockReturnValue({
      play: mockPlay,
      activeTracks: [] // No active tracks
    });
    
    render(<AudioTrackSelector />);
    
    // Click the Add Track button
    fireEvent.click(screen.getByText('Add Track'));
    
    // Wait for assets to load
    await waitFor(() => {
      expect(screen.getByText('test-track.mp3')).toBeInTheDocument();
    });
    
    // Click the play button next to the track
    const playButtons = screen.getAllByTitle('Play track');
    fireEvent.click(playButtons[0]);
    
    // Verify play was called with the correct parameters
    expect(mockPlay).toHaveBeenCalledWith('/audio/test-track.mp3', {
      replace: false,
      locationId: '',
      loop: true,
      name: 'test-track.mp3'
    });
  });
  
  it('shows "Already playing" for tracks that are currently playing', async () => {
    render(<AudioTrackSelector />);
    
    // Click the Add Track button
    fireEvent.click(screen.getByText('Add Track'));
    
    // Wait for assets to load
    await waitFor(() => {
      expect(screen.getByText('test-track.mp3')).toBeInTheDocument();
    });
    
    // Should show "Currently playing" for the track that is active
    expect(screen.getByText('Currently playing')).toBeInTheDocument();
    
    // Play button should be disabled
    expect(screen.getByTitle('Already playing')).toBeDisabled();
  });
  
  it('toggles the loop option when checkbox is clicked', async () => {
    render(<AudioTrackSelector />);
    
    // Click the Add Track button
    fireEvent.click(screen.getByText('Add Track'));
    
    // The loop checkbox should be checked by default
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    
    // Click the checkbox to uncheck it
    fireEvent.click(checkbox);
    
    // The checkbox should now be unchecked
    expect(checkbox).not.toBeChecked();
  });
}); 