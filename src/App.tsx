import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, ComponentType, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from './components/Navigation';
import { AudioTrackPanel } from './features/audio/components/AudioTrackPanel';
import { AppLoader } from './components/AppLoader';
import { StoreInitializer } from './components/StoreInitializer';
import { useStore } from './store';

// Declare the ReactMarkdownLoaded property on window
declare global {
  interface Window {
    ReactMarkdownLoaded: boolean;
  }
}

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
            <div className="glass-effect p-6 text-center max-w-md mx-auto mt-10">
              <h5 className="text-xl font-display font-bold text-error-DEFAULT mb-4">
                Failed to load component
              </h5>
              <button 
                className="px-5 py-2.5 bg-primary-DEFAULT text-text-primary rounded-lg hover:bg-primary-light transition-all duration-300 shadow-lg btn-glow"
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
            <div className="glass-effect p-8 text-center max-w-md mx-auto mt-10">
              <h5 className="text-xl font-display font-bold text-error-DEFAULT mb-4">
                Failed to load component
              </h5>
              <p className="mb-6 text-text-secondary">
                Error: {error.message}
              </p>
              <button 
                className="px-5 py-2.5 bg-primary-DEFAULT text-text-primary rounded-lg hover:bg-primary-light transition-all duration-300 shadow-lg btn-glow" 
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
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-primary-DEFAULT opacity-20 blur-xl animate-pulse-slow"></div>
      <div className="relative z-10">
        <AppLoader size="lg" text="Loading content..." />
      </div>
    </div>
  </div>
);

// Error handling component
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="glass-effect-strong p-8 text-center max-w-md mx-auto mt-10 animate-fade-in">
    <div className="w-16 h-16 mx-auto mb-4 relative">
      <div className="absolute inset-0 bg-error-DEFAULT opacity-20 rounded-full blur-xl animate-pulse"></div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h5 className="text-2xl font-display font-bold text-text-primary mb-2">
      Something went wrong
    </h5>
    <p className="mb-6 text-text-secondary">
      {error.message}
    </p>
    <button 
      className="px-5 py-2.5 bg-primary-DEFAULT text-text-primary rounded-lg hover:bg-primary-light transition-all duration-300 shadow-glow btn-glow"
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
  
  // Subtle parallax effect for decorative elements
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Background gradient with animated decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-background to-background-elevated">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
        
        {/* Animated nebula-like blurs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl bg-gradient-to-br from-primary-dark/10 via-primary/5 to-transparent opacity-30"
          style={{ 
            top: `calc(20% - ${mousePosition.y * 40}px)`, 
            left: `calc(15% - ${mousePosition.x * 40}px)`,
            transition: 'transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
        ></div>
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] bg-gradient-to-tr from-secondary-dark/10 via-secondary/10 to-transparent opacity-30"
          style={{ 
            bottom: `calc(30% - ${mousePosition.y * 30}px)`, 
            right: `calc(20% - ${mousePosition.x * 30}px)`,
            transition: 'transform 1s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
        ></div>
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px] bg-gradient-to-r from-accent/5 via-accent-dark/10 to-transparent opacity-20"
          style={{ 
            top: `calc(60% - ${mousePosition.y * 20}px)`, 
            right: `calc(35% - ${mousePosition.x * 20}px)`,
            transition: 'transform 1.2s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
        ></div>
        
        {/* Subtle border at the bottom for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border-DEFAULT/10 to-transparent"></div>
        
        {/* Very subtle grid overlay for depth - reduced opacity */}
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>
      
      <BrowserRouter basename="/campaignorganizer/">
        {/* Use min-h-screen to allow content to expand */}
        <div className="flex flex-col min-h-screen relative z-10">
          <StoreInitializer />
          <Navigation />
          {/* Main content area with padding for navigation */}
          <div className="flex-1 relative pt-16">
            {/* Content wrapper with scrolling */}
            <div className="animate-fade-in h-full overflow-auto scrollbar-thin">
              <Suspense fallback={<LoadingComponent />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/map" element={<MapViewLazy />} />
                  <Route path="/locations" element={<LocationsViewLazy />} />
                  <Route path="/characters" element={<CharactersViewLazy />} />
                  <Route path="/combats" element={<CombatsViewLazy />} />
                  <Route path="/combat-session" element={<CombatSessionViewLazy />} />
                  <Route path="/assets" element={<AssetsViewLazy />} />
                  
                  {/* Catch-all route to handle PDF and other asset URLs */}
                  <Route path="*" element={
                    <div className="p-4">
                      <script dangerouslySetInnerHTML={{ 
                        __html: `
                          // Check if current path is likely a PDF or asset
                          const path = window.location.pathname;
                          const isPdf = path.toLowerCase().endsWith('.pdf');
                          const containsFragment = window.location.hash.includes('toolbar=') || 
                                                  window.location.hash.includes('navpanes=');
                          
                          if (isPdf || containsFragment) {
                            // Extract base path without fragments
                            const cleanPath = path.split('#')[0];
                            // Redirect back to main app, we'll handle PDFs in components
                            window.location.replace('/campaignorganizer/');
                            
                            // Store the PDF path to potentially use later
                            sessionStorage.setItem('lastAttemptedPdfPath', cleanPath);
                          }
                        `
                      }} />
                      <h1 className="text-xl font-bold mb-4">Page Not Found</h1>
                      <p>The page you're looking for doesn't exist or you don't have permission to view it.</p>
                      <button 
                        onClick={() => window.location.href = '/campaignorganizer/'}
                        className="mt-4 px-4 py-2 bg-primary-DEFAULT text-white rounded hover:bg-primary-dark"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </div>
          </div>
          
          {/* AudioTrackPanel with enhanced styling */}
          <AudioTrackPanel />
        </div>
        {/* This component is never visible, but ensures ReactMarkdown is included */}
        <EnsureMarkdown />
      </BrowserRouter>
    </div>
  );
}

export default App; 