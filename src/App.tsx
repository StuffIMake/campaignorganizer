import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, ComponentType } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from './components/Navigation';
import { AudioTrackPanel } from './components/AudioTrackPanel';

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
const MapViewLazy = createLazyComponent(() => import('./pages/MapView'), 'MapView');
const LocationsViewLazy = createLazyComponent(() => import('./pages/LocationsView'), 'LocationsView');
const CharactersViewLazy = createLazyComponent(() => import('./pages/CharactersView'), 'CharactersView');
const CombatsViewLazy = createLazyComponent(() => import('./pages/CombatsView'), 'CombatsView');
const CombatSessionViewLazy = createLazyComponent(() => import('./pages/CombatSessionView'), 'CombatSessionView');

// Loading component for Suspense fallback
const LoadingComponent = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
  </div>
);

// Error handling component
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="p-3 text-center">
    <h5 className="text-xl font-bold text-red-500 mb-2">
      Something went wrong
    </h5>
    <p className="mb-4">
      {error.message}
    </p>
    <button 
      className="px-4 py-2 bg-primary-600 text-white rounded-[var(--radius-md)] hover:bg-primary-700 transition-colors"
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
  return (
    <div className="bg-gradient-to-b from-slate-950 to-slate-925 text-white min-h-screen font-[var(--font-body)]">
      <BrowserRouter basename="/campaignorganizer">
        <div className="flex flex-col h-screen">
          <Navigation />
          <div className="flex-grow overflow-auto relative scrollbar-thin">
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<MapViewLazy />} />
                <Route path="/locations" element={<LocationsViewLazy />} />
                <Route path="/characters" element={<CharactersViewLazy />} />
                <Route path="/combats" element={<CombatsViewLazy />} />
                <Route path="/combat-session" element={<CombatSessionViewLazy />} />
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