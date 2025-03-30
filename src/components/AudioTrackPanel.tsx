import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AudioTrackSelector } from './AudioTrackSelector';

export const AudioTrackPanel: React.FC = () => {
  const activeTracks = useStore((state) => state.activeTracks);
  const toggleMuteTrack = useStore((state) => state.toggleMuteTrack);
  const stopIndividualTrack = useStore((state) => state.stopIndividualTrack);
  const setTrackVolume = useStore((state) => state.setTrackVolume);
  const volume = useStore((state) => state.volume);
  const setVolume = useStore((state) => state.setVolume);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume || 0.7);
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({});
  const [isMinimized, setIsMinimized] = useState(false);

  // Update previousVolume when volume changes and not muted
  useEffect(() => {
    if (!isMasterMuted && volume > 0) {
      setPreviousVolume(volume);
    }
  }, [volume, isMasterMuted]);

  const handleMasterMute = () => {
    if (isMasterMuted) {
      // Unmute - restore previous volume
      setVolume(previousVolume);
    } else {
      // Remember current volume before muting
      if (volume > 0) {
        setPreviousVolume(volume);
      }
      // Mute - set volume to 0
      setVolume(0);
    }
    setIsMasterMuted(!isMasterMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolumeValue = parseFloat(e.target.value);
    setVolume(newVolumeValue);
    
    // If the user is adjusting volume to above 0, and we're muted, unmute
    if (isMasterMuted && newVolumeValue > 0) {
      setIsMasterMuted(false);
    }
    
    // If the user sets volume to 0, mute
    if (newVolumeValue === 0 && !isMasterMuted) {
      setIsMasterMuted(true);
    }
  };
  
  const handleTrackVolumeChange = (trackId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackVolume(trackId, parseFloat(e.target.value));
  };
  
  const toggleTrackExpand = (trackId: string) => {
    setExpandedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // If minimized, just show a music icon that can be clicked to maximize
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-5 left-5 bg-slate-800/90 text-white p-2 rounded-full shadow-lg z-50 hover:bg-slate-700/90 cursor-pointer"
        onClick={toggleMinimize}
        title="Audio Controls"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 p-4 max-w-xs max-h-[300px] overflow-y-auto bg-slate-800/90 z-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-white">Audio Controls</h2>
        <button 
          className="p-1 text-white/80 hover:text-white transition-colors"
          onClick={toggleMinimize}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>
      
      {/* Track Selector Button */}
      <AudioTrackSelector />
      
      {/* Master Volume Control */}
      <div className="mb-4 flex items-center gap-2">
        <button 
          className="p-1 text-white/80 hover:text-white transition-colors"
          onClick={handleMasterMute}
        >
          {volume === 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
        
        <span className="text-sm text-white min-w-[80px]">
          Master Volume
        </span>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full accent-blue-500"
        />
      </div>

      <div className="h-px bg-slate-600 my-3"></div>

      <h3 className="text-base font-medium text-white mb-2">
        Active Tracks
      </h3>
      
      {activeTracks.length === 0 ? (
        <p className="text-sm text-slate-400 italic">
          No tracks currently playing. Use the "Add Track" button to play some music.
        </p>
      ) : (
        <ul className="space-y-2">
          {activeTracks.map((track) => (
            <React.Fragment key={track.id}>
              <li className="flex items-center gap-2">
                <button 
                  className="p-1 text-white/80 hover:text-white transition-colors"
                  onClick={() => toggleMuteTrack(track.id)}
                >
                  {track.isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                
                <span 
                  className="flex-1 text-white text-sm cursor-pointer truncate"
                  onClick={() => toggleTrackExpand(track.id)}
                >
                  {track.name}
                </span>
                
                {/* Loop indicator */}
                <div className={`p-1 ${track.loop ? 'text-white' : 'text-white/30'}`}>
                  {track.loop ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                </div>
                
                <button 
                  className="p-1 text-white/80 hover:text-white transition-colors"
                  onClick={() => toggleTrackExpand(track.id)}
                >
                  {expandedTracks[track.id] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                <button 
                  className="p-1 text-white/80 hover:text-white transition-colors"
                  onClick={() => stopIndividualTrack(track.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
              
              {expandedTracks[track.id] && (
                <div className="pl-8 pr-4 pb-2 flex items-center gap-2">
                  <span className="text-xs text-white min-w-[60px]">
                    Volume
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume}
                    onChange={handleTrackVolumeChange(track.id)}
                    className="w-full accent-blue-500"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};