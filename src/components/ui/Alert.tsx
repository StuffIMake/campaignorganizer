import React, { useState, useEffect } from 'react';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface AlertProps {
  children: React.ReactNode;
  severity?: AlertSeverity;
  onClose?: () => void;
  variant?: 'filled' | 'outlined' | 'soft' | 'standard';
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  severity = 'info',
  onClose,
  variant = 'standard',
  className = '',
  icon,
  title,
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Handle close animation
  useEffect(() => {
    if (!isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  // Get color classes based on severity and variant
  const getColorClasses = () => {
    const colors = {
      success: {
        standard: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        filled: 'bg-green-600 text-white',
        outlined: 'border border-green-500 text-green-700 dark:text-green-400',
        soft: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      },
      error: {
        standard: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        filled: 'bg-red-600 text-white',
        outlined: 'border border-red-500 text-red-700 dark:text-red-400',
        soft: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      },
      warning: {
        standard: 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        filled: 'bg-amber-600 text-white',
        outlined: 'border border-amber-500 text-amber-700 dark:text-amber-400',
        soft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
      },
      info: {
        standard: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        filled: 'bg-blue-600 text-white',
        outlined: 'border border-blue-500 text-blue-700 dark:text-blue-400',
        soft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
      }
    };
    
    return colors[severity][variant];
  };
  
  // Get icon based on severity
  const getIcon = () => {
    if (icon) return icon;
    
    const getIconColor = () => {
      if (variant === 'filled') return 'text-white';
      const colors = {
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        warning: 'text-amber-500 dark:text-amber-400',
        info: 'text-blue-500 dark:text-blue-400'
      };
      return colors[severity];
    };
    
    const iconColor = getIconColor();
    
    switch (severity) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  return (
    <div 
      className={`
        rounded-lg overflow-hidden
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}
        ${getColorClasses()}
        shadow-sm
        ${className}
      `}
      role="alert"
    >
      <div className="px-4 py-3 flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0 mr-3 pt-0.5">
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-medium mb-1">
              {title}
            </div>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {/* Action */}
        {action && (
          <div className="ml-3">
            {action}
          </div>
        )}
        
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            className={`
              ml-3 flex-shrink-0 p-1 rounded-full 
              ${variant === 'filled' ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50'}
              focus:outline-none transition-colors
            `}
            onClick={() => setIsVisible(false)}
            aria-label="Close"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Add default export
export default Alert; 