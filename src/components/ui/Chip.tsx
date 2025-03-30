import React, { forwardRef } from 'react';

interface ChipProps {
  label: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined' | 'soft';
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
}

const Chip = forwardRef<HTMLDivElement, ChipProps>(({
  label,
  color = 'default',
  size = 'medium',
  variant = 'filled',
  icon,
  onClick,
  onDelete,
  className = '',
  disabled = false,
}, ref) => {
  // Base classes for all chips
  let baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
  
  // Classes based on interactivity
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:opacity-90 active:opacity-80' : '';
  
  // Size classes
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5 h-6',
    medium: 'text-sm px-3 py-1 h-8'
  }[size];
  
  // Generate color classes based on variant and color
  let colorClasses = '';
  
  if (variant === 'filled') {
    colorClasses = {
      default: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      primary: 'bg-primary-600 text-white',
      secondary: 'bg-secondary-600 text-white',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-amber-600 text-white',
      info: 'bg-blue-600 text-white'
    }[color];
  } else if (variant === 'outlined') {
    colorClasses = {
      default: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
      primary: 'border border-primary-600/70 text-primary-600 dark:text-primary-500',
      secondary: 'border border-secondary-600/70 text-secondary-600 dark:text-secondary-500',
      success: 'border border-green-600/70 text-green-600 dark:text-green-500',
      error: 'border border-red-600/70 text-red-600 dark:text-red-500',
      warning: 'border border-amber-600/70 text-amber-600 dark:text-amber-500',
      info: 'border border-blue-600/70 text-blue-600 dark:text-blue-500'
    }[color];
  } else if (variant === 'soft') {
    colorClasses = {
      default: 'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-300',
      primary: 'bg-primary-100/20 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
      secondary: 'bg-secondary-100/20 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
      success: 'bg-green-100/20 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      error: 'bg-red-100/20 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      warning: 'bg-amber-100/20 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      info: 'bg-blue-100/20 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }[color];
  }
  
  // Disabled state
  if (disabled) {
    baseClasses += ' opacity-50 cursor-default pointer-events-none';
  }
  
  // Delete button styling
  const deleteButtonClasses = `
    ml-1 
    -mr-1
    rounded-full 
    h-5 
    w-5 
    inline-flex 
    items-center 
    justify-center 
    hover:bg-black/10
    dark:hover:bg-white/10 
    transition-colors
    ${size === 'small' ? 'text-xs' : 'text-sm'}
  `;
  
  return (
    <div
      ref={ref}
      className={`${baseClasses} ${sizeClasses} ${colorClasses} ${interactiveClasses} ${className}`}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
      <span className="truncate">{label}</span>
      {onDelete && (
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && onDelete) onDelete(e);
          }}
          className={deleteButtonClasses}
          disabled={disabled}
          aria-label="Remove"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
});

Chip.displayName = 'Chip';

export default Chip; 