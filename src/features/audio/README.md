# Audio Feature

This feature manages audio playback throughout the application. It provides functionality for playing, stopping, and controlling audio tracks with a consistent API.

## Key Components

- `AudioTrackPanel`: Floating panel UI for controlling audio tracks and volume
- `AudioTrackSelector`: Dialog for selecting and playing audio tracks from the library

## State Management

Audio state is managed through a dedicated Zustand slice:
- `audioSlice.ts`: Contains state for tracking audio tracks and their playback status

## Custom Hooks

- `useAudioPlayer`: Custom hook that provides a simplified API for working with audio

## Implementation Details

### Adding and Playing Tracks

Tracks are played using the Howler.js library, which provides a consistent cross-browser audio API. The playback state is stored in the Zustand store, allowing components across the application to access and control audio.

```typescript
// Example: Playing a track
const { play } = useAudioPlayer();
play('/audio/background-music.mp3', { 
  loop: true, 
  locationId: 'tavern' 
});
```

### Volume Control

The audio system supports both master volume control and per-track volume adjustments:

```typescript
// Example: Setting volume
const { setMasterVolume, adjustTrackVolume } = useAudioPlayer();
setMasterVolume(0.5); // Set master volume to 50%
adjustTrackVolume('track-id', 0.8); // Set specific track to 80%
```

## Integration

The audio feature integrates with:
- Asset management (to access audio files)
- Locations (to associate tracks with locations)
- Combats (to play combat-specific audio)

## Future Improvements

- Implement cross-fading between tracks
- Add audio categories (background music, effects, ambient)
- Support playlists for sequential playback 