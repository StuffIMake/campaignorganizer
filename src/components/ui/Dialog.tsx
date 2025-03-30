import React, { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullWidth?: boolean;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onClose, 
  children, 
  maxWidth = 'sm',
  fullWidth = false,
  className = '',
}) => {
  if (!open) return null;
  
  // Calculate max width based on the prop
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'xs': return 'max-w-xs';
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-2xl';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-7xl';
      case 'full': return 'max-w-[calc(100%-2rem)]';
      default: return 'max-w-md';
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with animated opacity */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog positioning */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Dialog panel with animations */}
        <div 
          className={`
            relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 
            text-left shadow-xl transition-all duration-300 ease-out
            ${getMaxWidth()} ${fullWidth ? 'w-full' : ''}
            border border-slate-200 dark:border-slate-700
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

interface DialogTitleProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ 
  children, 
  onClose, 
  className = '' 
}) => {
  return (
    <div className={`
      px-6 py-4 border-b border-slate-200 dark:border-slate-700
      bg-slate-50 dark:bg-slate-800
      flex items-center justify-between
      ${className}
    `}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {children}
      </h3>
      
      {onClose && (
        <button
          type="button"
          className="rounded-full p-1.5 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:outline-none transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  dividers?: boolean;
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  children,
  className = '',
  dividers = false
}) => {
  return (
    <div className={`
      px-6 py-4
      ${dividers ? 'border-y border-slate-200 dark:border-slate-700' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

interface DialogActionsProps {
  children: ReactNode;
  className?: string;
}

export const DialogActions: React.FC<DialogActionsProps> = ({ 
  children,
  className = ''
}) => {
  return (
    <div className={`
      px-6 py-3 flex items-center justify-end space-x-2
      bg-slate-50 dark:bg-slate-800
      border-t border-slate-200 dark:border-slate-700
      ${className}
    `}>
      {children}
    </div>
  );
}; 