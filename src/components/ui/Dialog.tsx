import React, { ReactNode, useId, useRef, createContext, useContext, useEffect } from 'react';
import { useOverlay, useModal, useDialog, FocusScope } from 'react-aria';
import type { AriaDialogProps } from 'react-aria';
import ReactDOM from 'react-dom';

// Create a context to pass down titleProps
const DialogContext = createContext<Record<string, any> | null>(null);

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullWidth?: boolean;
  className?: string;
  title?: string;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onClose, 
  children, 
  maxWidth = 'sm',
  fullWidth = false,
  className = '',
  title
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Disable body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Hook to handle overlay interactions (modal state, closing)
  const { overlayProps, underlayProps } = useOverlay(
    { isOpen: open, onClose, isDismissable: true },
    ref
  );

  // Hook to make the dialog modal (prevents interaction outside)
  const { modalProps } = useModal();

  // Prepare props for useDialog
  const dialogHookProps: AriaDialogProps = {
    role: 'dialog',
    ...(title && { 'aria-label': title })
  };

  // Hook for dialog specific ARIA attributes
  const { dialogProps, titleProps } = useDialog(dialogHookProps, ref);

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
  
  const dialogContent = (
    <DialogContext.Provider value={titleProps}>
      {/* Portal the dialog to the body to avoid any container constraints */}
      <div className="dialog-overlay fixed inset-0 z-[10000] overflow-hidden">
        {/* Semi-transparent backdrop */}
        <div 
          className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-md transition-opacity duration-300 ease-out"
          onClick={onClose}
        />
        
        {/* Centered dialog container */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <FocusScope contain restoreFocus autoFocus>
            <div 
              {...modalProps}
              {...dialogProps}
              ref={ref}
              className={`
                relative max-h-[90vh] overflow-hidden rounded-2xl 
                bg-white dark:bg-slate-900 
                text-left shadow-2xl transition-all duration-300 ease-out
                ${getMaxWidth()} ${fullWidth ? 'w-full' : ''}
                border border-slate-200 dark:border-slate-700
                animate-dialog-appear
                z-[10001]
                ${className}
              `}
              onClick={e => e.stopPropagation()}
            >
              {children}
            </div>
          </FocusScope>
        </div>
      </div>
    </DialogContext.Provider>
  );

  // Use a portal to render the dialog at the document body level
  return ReactDOM.createPortal(
    dialogContent,
    document.body
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
  className = '',
}) => {
  // Get titleProps from context
  const titleProps = useContext(DialogContext);

  return (
    <div className={`
      px-6 py-4 border-b border-slate-200 dark:border-slate-700
      bg-slate-50 dark:bg-slate-800
      flex items-center justify-between
      ${className}
    `}>
      <h3 
        {...titleProps}
        className="text-lg font-semibold text-slate-900 dark:text-white"
      >
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

// Add display name for reliable type checking
DialogTitle.displayName = 'DialogTitle';

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
      px-6 py-4 overflow-y-auto
      ${dividers ? 'border-y border-slate-200 dark:border-slate-700' : ''}
      ${className}
    `} style={{ maxHeight: 'calc(70vh)', overflowY: 'auto' }}>
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