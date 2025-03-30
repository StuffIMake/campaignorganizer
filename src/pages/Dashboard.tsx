import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AssetDropZone } from '../components/AssetDropZone';
import { AssetManager } from '../services/assetManager';
import MarkdownContent from '../components/MarkdownContent';
import { Button, Dialog } from '../components/ui';

export const Dashboard: React.FC = () => {
  const { locations, characters, combats } = useStore();
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [audioAssetCount, setAudioAssetCount] = useState(0);
  
  // Markdown example for debugging
  const markdownExample = `# Markdown Examples
  
## Basic Formatting
**Bold text** and *italic text*

## Lists
* Item 1
* Item 2
  * Nested item

## Links
[Example Link](https://example.com)

## Code
\`\`\`
function example() {
  return "This is code";
}
\`\`\`
`;

  useEffect(() => {
    // Load audio asset count
    const loadAudioAssets = async () => {
      const audioAssets = await AssetManager.getAssets('audio');
      setAudioAssetCount(audioAssets.length);
    };
    loadAudioAssets();
  }, []);

  const stats = [
    { label: 'Total Locations', value: locations.length },
    { label: 'Total Characters', value: characters.length },
    { label: 'Available Music Tracks', value: audioAssetCount },
    { label: 'Combat Encounters', value: combats.length },
  ];

  const handleAssetManagerClose = () => {
    setIsAssetManagerOpen(false);
  };

  const handleAssetImport = async () => {
    // Refresh audio asset count after import
    const audioAssets = await AssetManager.getAssets('audio');
    setAudioAssetCount(audioAssets.length);
  };

  return (
    <div className="p-6 max-w-[var(--content-width-xl)] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">
          Campaign Dashboard
        </h1>
        <Button 
          variant="primary"
          onClick={() => setIsAssetManagerOpen(true)}
        >
          Manage Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-effect rounded-[var(--radius-lg)] shadow-lg p-5">
            <h2 className="text-base font-medium text-slate-300 mb-2">
              {stat.label}
            </h2>
            <p className="text-3xl font-bold text-primary-400">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-effect rounded-[var(--radius-lg)] shadow-lg p-5">
          <h2 className="text-xl font-medium text-white mb-4 border-b border-slate-700/50 pb-2">
            Recent Locations
          </h2>
          <div className="space-y-2">
            {locations.slice(0, 5).map((location) => (
              <div key={location.id} className="p-2 hover:bg-slate-800/60 rounded-[var(--radius-md)] transition-all">
                {location.name}
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-slate-400 italic p-2">No locations added yet</p>
            )}
          </div>
        </div>

        <div className="glass-effect rounded-[var(--radius-lg)] shadow-lg p-5">
          <h2 className="text-xl font-medium text-white mb-4 border-b border-slate-700/50 pb-2">
            Recent Characters
          </h2>
          <div className="space-y-2">
            {characters.slice(0, 5).map((character) => (
              <div key={character.id} className="p-2 hover:bg-slate-800/60 rounded-[var(--radius-md)] transition-all">
                {character.name} <span className="text-slate-400">- {character.type}</span>
              </div>
            ))}
            {characters.length === 0 && (
              <p className="text-slate-400 italic p-2">No characters added yet</p>
            )}
          </div>
        </div>
      </div>
      
      <Dialog
        open={isAssetManagerOpen}
        onClose={handleAssetManagerClose}
        title="Asset Manager"
        maxWidth="xl"
        actions={
          <Button 
            variant="outline"
            onClick={handleAssetManagerClose}
          >
            Close
          </Button>
        }
      >
        <AssetDropZone onAssetImport={handleAssetImport} />
      </Dialog>

      <div className="h-px bg-slate-700/50 my-8"></div>
      <h2 className="text-xl font-medium text-white mb-4">Preview:</h2>
      <div className="glass-effect p-5 rounded-[var(--radius-lg)] scrollbar-thin shadow-lg">
        <MarkdownContent content={markdownExample} debug={true} />
      </div>
      <div className="mt-6 p-5 bg-primary-950/20 backdrop-blur-sm border border-primary-900/30 rounded-[var(--radius-lg)] shadow-lg">
        <h3 className="text-lg font-medium text-primary-300 mb-3">
          Troubleshooting Markdown Display:
        </h3>
        <p className="text-slate-300 mb-3">
          If markdown isn't displaying correctly in the deployed version, please:
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
          <li>
            Check the browser console for any errors (F12 &gt; Console)
          </li>
          <li>
            Try refreshing the page with cache clearing (Ctrl+F5 or Cmd+Shift+R)
          </li>
          <li>
            Temporarily disable any browser extensions that might interfere
          </li>
        </ul>
      </div>
    </div>
  );
}; 