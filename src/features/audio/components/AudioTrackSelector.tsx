import React, { useState, useEffect } from 'react';
import { AssetManager } from '../../../services/assetManager';
import { PlayArrowIcon, VolumeUpIcon, AddIcon } from '../../../assets/icons';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

/**
 * Component for selecting and playing audio tracks.
 * Displays a modal dialog with a list of available audio tracks.
 */
export const AudioTrackSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [audioAssets, setAudioAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loop, setLoop] = useState(true);
  
  const { play, activeTracks } = useAudioPlayer();
  
  // Load audio assets when dialog opens
  useEffect(() => {
    if (open) {
      loadAudioAssets();
    }
  }, [open]);
  
  const loadAudioAssets = async () => {
    setIsLoading(true);
    try {
      const assets = await AssetManager.getAssets('audio');
      setAudioAssets(assets.map(asset => asset.name));
    } catch (error) {
      console.error('Error loading audio assets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handlePlayTrack = (trackName: string) => {
    // Format the track name as expected by play
    const trackPath = `/audio/${trackName}`;
    
    // Play the track with the loop option and a stable locationId
    // We use an empty locationId to indicate this is not tied to a location
    play(trackPath, { 
      replace: false, 
      locationId: '', 
      loop,
      name: trackName
    });
    
    // Close the dialog
    handleClose();
  };
  
  // Check if a track is already playing
  const isTrackPlaying = (trackName: string) => {
    return activeTracks.some(track => track.name === trackName);
  };
  
  // Filter assets based on search term
  const filteredAssets = audioAssets.filter(asset => 
    asset.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <button 
        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm mb-2 hover:bg-blue-700 transition-colors"
        onClick={handleOpen}
      >
        <AddIcon size={16} className="mr-1" />
        Add Track
      </button>
      
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          ></div>
          
          {/* Dialog */}
          <div className="relative bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-medium text-white">Select Audio Track</h2>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              <div className="mb-4">
                <p className="text-sm text-slate-300 mb-2">
                  Select a track to play. You can choose whether to loop it or play it once.
                </p>
                
                <div className="relative mb-4">
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    placeholder="Search tracks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                  />
                  <div className="relative w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  <span className="ml-2 text-sm text-white">Loop Track</span>
                </label>
              </div>
              
              <div className="h-px bg-slate-700 mb-3"></div>
              
              {isLoading ? (
                <p className="text-white">Loading audio assets...</p>
              ) : audioAssets.length === 0 ? (
                <p className="text-white">No audio assets found. Import some audio files first.</p>
              ) : (
                <ul className="max-h-[300px] overflow-y-auto pr-1">
                  {filteredAssets.map((asset) => {
                    const alreadyPlaying = isTrackPlaying(asset);
                    return (
                      <li
                        key={asset}
                        className="flex items-center justify-between py-2 border-b border-slate-700 last:border-none"
                      >
                        <div>
                          <span className="text-white">{asset}</span>
                          {alreadyPlaying && (
                            <p className="text-xs text-blue-400">Currently playing</p>
                          )}
                        </div>
                        <div 
                          className="group relative" 
                          title={alreadyPlaying ? "Already playing" : "Play track"}
                          data-disabled={alreadyPlaying}
                          aria-disabled={alreadyPlaying}
                        >
                          <button 
                            className={`p-2 rounded-full ${alreadyPlaying ? 'text-blue-400 cursor-not-allowed' : 'text-white hover:bg-slate-700'}`}
                            onClick={() => !alreadyPlaying && handlePlayTrack(asset)}
                            disabled={alreadyPlaying}
                          >
                            {alreadyPlaying ? (
                              <VolumeUpIcon size={20} />
                            ) : (
                              <PlayArrowIcon size={20} />
                            )}
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-xs text-white py-1 px-2 rounded whitespace-nowrap">
                            {alreadyPlaying ? "Already playing" : "Play track"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-700 flex justify-end">
              <button 
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 