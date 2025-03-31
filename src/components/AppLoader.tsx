import React from 'react';

interface AppLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

/**
 * A modern, sleek loading indicator
 */
export const AppLoader: React.FC<AppLoaderProps> = ({
  size = 'md',
  color = 'primary',
  text = '',
  fullScreen = false
}) => {
  // Size mapping
  const sizeMap = {
    sm: {
      container: 'h-5 w-5',
      circle: 'h-5 w-5 border-2',
      text: 'text-xs mt-2'
    },
    md: {
      container: 'h-8 w-8',
      circle: 'h-8 w-8 border-2',
      text: 'text-sm mt-3'
    },
    lg: {
      container: 'h-12 w-12',
      circle: 'h-12 w-12 border-3',
      text: 'text-base mt-4'
    },
    xl: {
      container: 'h-16 w-16',
      circle: 'h-16 w-16 border-4',
      text: 'text-lg mt-4'
    }
  };

  // Color mapping
  const colorMap = {
    primary: {
      outer: 'border-indigo-500/20',
      inner: 'border-t-indigo-500'
    },
    secondary: {
      outer: 'border-amber-500/20',
      inner: 'border-t-amber-500'
    },
    white: {
      outer: 'border-white/20',
      inner: 'border-t-white'
    }
  };

  const selectedSize = sizeMap[size];
  const selectedColor = colorMap[color];

  const loaderComponent = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer circle - static */}
        <div className={`rounded-full ${selectedSize.circle} border-solid ${selectedColor.outer}`}></div>
        
        {/* Inner spinning circle */}
        <div className={`
          absolute top-0 left-0 
          rounded-full ${selectedSize.circle} border-solid ${selectedColor.inner}
          animate-spin
        `}></div>
        
        {/* Optional subtle pulsing glow */}
        <div className={`
          absolute -inset-1.5
          bg-${color === 'primary' ? 'indigo' : color === 'secondary' ? 'amber' : 'white'}-500/10
          rounded-full blur-sm opacity-0 animate-pulse-slow
        `}></div>
      </div>
      
      {text && (
        <div className={`${selectedSize.text} text-slate-300 font-normal`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {loaderComponent}
      </div>
    );
  }

  return loaderComponent;
};

/**
 * A sleek, full-page loading screen with branding
 */
export const AppSplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background glow elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40%] h-[30%] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* App logo or brand icon could go here */}
        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 mb-8 font-[var(--font-display)]">
          Campaign Organizer
        </div>
        
        <AppLoader size="lg" text="Loading..." />
        
        <div className="mt-12 text-slate-500 text-sm animate-pulse">
          Preparing your campaign...
        </div>
      </div>
    </div>
  );
};

export default AppLoader;

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