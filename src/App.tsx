import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, ComponentType } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from './components/Navigation';
import { AudioTrackPanel } from './features/audio/components/AudioTrackPanel';
import { AppLoader } from './components/AppLoader';
import { StoreInitializer } from './components/StoreInitializer';
import { useStore } from './store';

// Regular import for the Dashboard as it's likely the first page users see
import { Dashboard } from './pages/Dashboard';

// Helper function to create resilient lazy components
const createLazyComponent = (
  importFn: () => Promise<any>, 
  componentName: string
): ComponentType => {
  return lazy(() => 
    importFn()
      .then((module: any) => {
        if (module[componentName]) {
          return { default: module[componentName] };
        }
        console.error(`Component ${componentName} not found in the module`);
        return { 
          default: () => (
            <div className="p-3 text-center">
              <h5 className="text-xl font-bold text-red-500 mb-2">
                Failed to load component
              </h5>
              <button 
                className="px-4 py-2 bg-primary-600 text-white rounded-[var(--radius-md)] hover:bg-primary-700 transition-colors"
                onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          )
        };
      })
      .catch((error: Error) => {
        console.error(`Error loading component ${componentName}:`, error);
        return { 
          default: () => (
            <div className="p-3 text-center">
              <h5 className="text-xl font-bold text-red-500 mb-2">
                Failed to load component
              </h5>
              <p className="mb-4">
                Error: {error.message}
              </p>
              <button 
                className="px-4 py-2 bg-primary-600 text-white rounded-[var(--radius-md)] hover:bg-primary-700 transition-colors" 
                onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          )
        };
      })
  );
};

// Lazy load other pages to reduce initial bundle size
const MapViewLazy = createLazyComponent(() => import('./features/map/views/MapView'), 'MapView');
const LocationsViewLazy = createLazyComponent(() => import('./features/locations/views/LocationsView'), 'LocationsView');
const CharactersViewLazy = createLazyComponent(() => import('./features/characters/views/CharactersView'), 'CharactersView');
const CombatsViewLazy = createLazyComponent(() => import('./features/combats/views/CombatsView'), 'CombatsView');
const CombatSessionViewLazy = createLazyComponent(() => import('./features/combats/views/CombatSessionView'), 'CombatSessionView');
const AssetsViewLazy = createLazyComponent(() => import('./features/assets/views/AssetsView'), 'AssetsView');

// Loading component for Suspense fallback
const LoadingComponent = () => (
  <div className="flex justify-center items-center h-full p-10">
    <AppLoader size="lg" text="Loading content..." />
  </div>
);

// Error handling component
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="p-6 text-center bg-white/5 backdrop-blur-sm rounded-[var(--radius-lg)] border border-white/10 m-4 shadow-xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h5 className="text-xl font-bold text-slate-100 mb-2">
      Something went wrong
    </h5>
    <p className="mb-4 text-slate-300">
      {error.message}
    </p>
    <button 
      className="px-5 py-2.5 bg-indigo-600 text-white rounded-[var(--radius-md)] hover:bg-indigo-700 transition-colors shadow-md"
      onClick={resetErrorBoundary}>
      Try again
    </button>
  </div>
);

// Create a simple global variable to check if ReactMarkdown is loaded
window.ReactMarkdownLoaded = true;

// Small component to ensure ReactMarkdown is included in the bundle
// This is never rendered but tricks the bundler
const EnsureMarkdown = () => {
  // This is a "secret" component that never renders
  // It ensures React-Markdown is included in the bundle
  if (false) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>test</ReactMarkdown>;
  }
  return null;
};

function App() {
  const hasAssets = useStore((state) => state.hasAssets);

  return (
    <div className="min-h-screen font-[var(--font-body)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[40%] h-[70%] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-[30%] -left-[15%] w-[50%] h-[60%] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[20%] right-[10%] w-[40%] h-[70%] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <BrowserRouter basename="/campaignorganizer/">
        <div className="flex flex-col h-screen relative z-10">
          <StoreInitializer />
          <Navigation />
          <div className="flex-grow overflow-auto relative scrollbar-thin pt-16">
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<MapViewLazy />} />
                <Route path="/locations" element={<LocationsViewLazy />} />
                <Route path="/characters" element={<CharactersViewLazy />} />
                <Route path="/combats" element={<CombatsViewLazy />} />
                <Route path="/combat-session" element={<CombatSessionViewLazy />} />
                <Route path="/assets" element={<AssetsViewLazy />} />
              </Routes>
            </Suspense>
          </div>
          
          {/* AudioTrackPanel rendered at App level so it's globally available */}
          <AudioTrackPanel />
        </div>
        {/* This component is never visible, but ensures ReactMarkdown is included */}
        <EnsureMarkdown />
      </BrowserRouter>
    </div>
  );
}

export default App; 