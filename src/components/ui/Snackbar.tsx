import React, { forwardRef, useEffect, useState } from 'react';
import Paper from './Paper';
import IconButton from './IconButton';
import { CloseIcon } from '../../assets/icons';

interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  autoHideDuration?: number;
  onClose?: () => void;
  message?: React.ReactNode;
  action?: React.ReactNode;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  className?: string;
  sx?: Record<string, any>;
}

const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(({
  open,
  autoHideDuration = 6000,
  onClose,
  message,
  action,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  className = '',
  sx = {},
  children,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Set up auto-hide timer when snackbar is shown
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      
      if (autoHideDuration && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoHideDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      // Add a slight delay before removing from DOM to allow for exit animations
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);
  
  // Don't render anything if not visible
  if (!open && !isVisible) {
    return null;
  }
  
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.mt) inlineStyle.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.ml) inlineStyle.marginLeft = `${sx.ml * 0.25}rem`;
  if (sx.mr) inlineStyle.marginRight = `${sx.mr * 0.25}rem`;
  
  // Position the snackbar based on anchorOrigin
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1400,
    ...inlineStyle
  };
  
  // Set vertical position
  if (anchorOrigin.vertical === 'top') {
    positionStyles.top = '16px';
  } else {
    positionStyles.bottom = '16px';
  }
  
  // Set horizontal position
  if (anchorOrigin.horizontal === 'left') {
    positionStyles.left = '16px';
  } else if (anchorOrigin.horizontal === 'center') {
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  } else {
    positionStyles.right = '16px';
  }
  
  return (
    <div
      ref={ref}
      className={`snackbar ${className}`}
      style={positionStyles}
      {...props}
    >
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 16px',
          color: 'white',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderRadius: '4px',
          minWidth: '288px',
          maxWidth: '500px',
          boxShadow: '0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12)',
          opacity: open ? 1 : 0,
          transform: `translateY(${open ? 0 : '20px'})`,
          transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1), transform 225ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{ flexGrow: 1, padding: '8px 0' }}>
          {message || children}
        </div>
        {action || (onClose && (
          <IconButton 
            onClick={onClose}
            sx={{ marginLeft: '8px', color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        ))}
      </Paper>
    </div>
  );
});

Snackbar.displayName = 'Snackbar';

export default Snackbar; 