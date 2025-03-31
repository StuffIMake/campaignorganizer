import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AssetDropZone } from '../features/assets/components';
import { AssetManager } from '../services/assetManager';
import MarkdownContent from '../components/MarkdownContent';
import { Button, Dialog, DialogTitle, DialogContent, Card, CardContent, CardHeader, IconButton } from '../components/ui';

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
    { 
      label: 'Total Locations', 
      value: locations.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-indigo-500/20 to-indigo-700/20'
    },
    { 
      label: 'Total Characters', 
      value: characters.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-amber-500/20 to-amber-700/20'
    },
    { 
      label: 'Available Music', 
      value: audioAssetCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: 'from-emerald-500/20 to-emerald-700/20'
    },
    { 
      label: 'Combat Encounters', 
      value: combats.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-red-500/20 to-red-700/20'
    },
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500">
          Campaign Dashboard
        </h1>
        <Button 
          variant="glass"
          color="primary"
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
          }
          onClick={() => setIsAssetManagerOpen(true)}
        >
          Manage Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className="hover-lift overflow-visible"
            variant="glass"
          >
            <CardContent className="p-5 relative z-10">
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-br rounded-[var(--radius-lg)] opacity-20 z-0 pointer-events-none ${stat.color}" />
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-medium text-slate-200 mb-1">
                    {stat.label}
                  </h2>
                  <p className="text-4xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg text-indigo-300">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card variant="glass" className="hover-lift">
          <CardHeader 
            title={<span className="text-xl font-semibold text-white">Recent Locations</span>}
            action={
              <Button 
                variant="text" 
                color="default"
                size="small"
                href="/locations"
              >
                View All
              </Button>
            }
          />
          <CardContent className="px-5 pb-4 pt-0">
            <div className="space-y-1">
              {locations.slice(0, 5).map((location) => (
                <div 
                  key={location.id} 
                  className="p-2 hover:bg-white/5 rounded-[var(--radius-md)] transition-all flex items-center"
                >
                  <span className="text-indigo-300 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </span>
                  {location.name}
                </div>
              ))}
              {locations.length === 0 && (
                <div className="text-slate-400 italic p-2 flex items-center">
                  <span className="text-slate-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  No locations added yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover-lift">
          <CardHeader 
            title={<span className="text-xl font-semibold text-white">Recent Characters</span>}
            action={
              <Button 
                variant="text" 
                color="default"
                size="small"
                href="/characters"
              >
                View All
              </Button>
            }
          />
          <CardContent className="px-5 pb-4 pt-0">
            <div className="space-y-1">
              {characters.slice(0, 5).map((character) => (
                <div 
                  key={character.id} 
                  className="p-2 hover:bg-white/5 rounded-[var(--radius-md)] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-amber-300 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    {character.name}
                  </div>
                  <span className="text-slate-400 text-sm bg-white/5 px-2 py-0.5 rounded">
                    {character.type}
                  </span>
                </div>
              ))}
              {characters.length === 0 && (
                <div className="text-slate-400 italic p-2 flex items-center">
                  <span className="text-slate-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  No characters added yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isAssetManagerOpen && (
        <Dialog
          open={isAssetManagerOpen}
          onClose={handleAssetManagerClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Asset Manager</DialogTitle>
          <DialogContent>
            <AssetDropZone 
              onAssetImport={handleAssetImport} 
              onClose={handleAssetManagerClose}
            />
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}; 