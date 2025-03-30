import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';

export const Navigation: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(false);
  
  const { saveDataToIndexedDB, exportToZip } = useStore();
  
  // Add responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleSave = async () => {
    try {
      const result = await saveDataToIndexedDB();
      alert(result.message);
    } catch (error) {
      alert(`Error saving data: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const handleExport = async () => {
    try {
      const result = await exportToZip();
      if (result.success && result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = 'campaign-data.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(`Error exporting data: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ) },
    { path: '/map', label: 'Map View', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ) },
    { path: '/locations', label: 'Locations Editor', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) },
    { path: '/characters', label: 'Characters Editor', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) },
    { path: '/combats', label: 'Combats Editor', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) }
  ];

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-40 
        transition-all duration-300 ease-in-out
        ${scrolled ? 'bg-slate-900/95 shadow-lg' : 'bg-slate-900/50'} 
        backdrop-blur-lg border-b border-slate-700/50
      `}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {isMobile && (
            <button
              className="text-white p-2 rounded-lg hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all"
              aria-label="menu"
              onClick={toggleDrawer}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          <h1 className="text-xl font-bold font-[var(--font-display)] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">
            Campaign Organizer
          </h1>
          
          {!isMobile && (
            <nav className="flex items-center space-x-1 mx-4 flex-1 justify-center">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`
                    px-3 py-2 rounded-lg transition-all duration-200 flex items-center relative overflow-hidden
                    ${isActive(item.path) 
                      ? 'text-white font-medium' 
                      : 'text-slate-300 hover:text-primary-400 hover:bg-slate-800/50'
                    }
                  `}
                >
                  {isActive(item.path) && (
                    <span className="absolute inset-0 bg-primary-600/80 -z-10 rounded-lg shadow-sm"></span>
                  )}
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}
          
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all" 
              onClick={handleSave} 
              title="Save Campaign"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all" 
              onClick={handleExport} 
              title="Export Campaign"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer - Improved */}
      <div 
        className={`
          fixed inset-0 z-50 overflow-hidden pointer-events-none
          transition-all duration-300 ease-in-out
          ${!drawerOpen && 'opacity-0'}
        `}
      >
        {/* Backdrop with improved blur and transitions */}
        <div 
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300 
            ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}
          `}
          onClick={toggleDrawer}
        ></div>
        
        {/* Drawer panel with better animation and styling */}
        <div 
          className={`
            absolute inset-y-0 left-0 max-w-xs w-full bg-slate-900/95 backdrop-blur-lg
            shadow-2xl border-r border-slate-700/50 pointer-events-auto
            transition-transform duration-300 ease-out
            ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav className="h-full flex flex-col py-5 overflow-y-auto">
            <div className="px-5 mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 font-[var(--font-display)]">
                Campaign Organizer
              </h2>
              <button 
                onClick={toggleDrawer}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 px-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary-600/90 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-primary-400'
                    }
                  `}
                  onClick={toggleDrawer}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="px-3 mt-6 border-t border-slate-800 pt-6">
              <button
                className="flex items-center w-full px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/70 hover:text-primary-400 transition-all"
                onClick={() => { toggleDrawer(); handleSave(); }}
              >
                <span className="mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </span>
                <span>Save Campaign</span>
              </button>
              <button
                className="flex items-center w-full px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/70 hover:text-primary-400 transition-all"
                onClick={() => { toggleDrawer(); handleExport(); }}
              >
                <span className="mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </span>
                <span>Export Campaign</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  );
}; 