import React from 'react';

interface AppLoaderProps {
  loading?: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  loading = true,
  message = 'Loading...',
  fullScreen = true
}) => {
  if (!loading) return null;
  
  return (
    <div 
      className={`
        flex flex-col items-center justify-center
        bg-slate-900/90 backdrop-blur-md
        transition-opacity duration-500 ease-in-out
        ${fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10 rounded-lg'}
      `}
    >
      <div className="relative">
        {/* Glowing circle background with slow pulse animation */}
        <div className="absolute -inset-8 bg-primary-600/20 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Primary spinner */}
        <div className="relative">
          {/* Outer spinner ring */}
          <div className="w-16 h-16 border-4 border-primary-200/20 border-t-primary-500 rounded-full animate-spin"></div>
          
          {/* Inner spinner with reverse animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600/30 border-b-primary-600 rounded-full animate-spin-reverse"></div>
          </div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Loading text with typewriter effect */}
      <div className="mt-6 text-white font-medium">
        <span className="inline-block min-w-[7rem] text-center">
          {message}
          <span className="inline-block w-1 h-4 ml-1 bg-primary-400 animate-blink"></span>
        </span>
      </div>
    </div>
  );
};

// Add to index.css or tailwind.config.js:
//
// @keyframes spin-reverse {
//   from {
//     transform: rotate(0deg);
//   }
//   to {
//     transform: rotate(-360deg);
//   }
// }
//
// @keyframes blink {
//   0%, 100% {
//     opacity: 1;
//   }
//   50% {
//     opacity: 0;
//   }
// }
//
// @keyframes pulse-slow {
//   0%, 100% {
//     opacity: 0.4;
//   }
//   50% {
//     opacity: 0.1;
//   }
// }
//
// .animate-spin-reverse {
//   animation: spin-reverse 1.5s linear infinite;
// }
//
// .animate-blink {
//   animation: blink 0.8s steps(1, end) infinite;
// }
//
// .animate-pulse-slow {
//   animation: pulse-slow 3s ease-in-out infinite;
// } 