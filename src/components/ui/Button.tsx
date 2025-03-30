import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text' | 'contained' | 'outlined' | 'ghost' | 'glass';
  size?: 'small' | 'medium' | 'large' | 'icon';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  sx?: Record<string, any>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  isLoading = false,
  loadingText,
  disabled,
  className = '',
  sx = {},
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none';
  
  // Map Material UI variant names to our internal variants
  let mappedVariant = variant;
  if (variant === 'contained') mappedVariant = 'primary';
  if (variant === 'outlined') mappedVariant = 'outline';
  
  // Determine border radius based on size
  const radiusClasses = size === 'icon' ? 'rounded-full' : 'rounded-md';
  
  // Classes based on color
  const colorClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800 text-white border border-transparent focus-visible:ring-primary-500',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 focus:bg-secondary-700 active:bg-secondary-800 text-white border border-transparent focus-visible:ring-secondary-500',
    success: 'bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-800 text-white border border-transparent focus-visible:ring-green-500',
    error: 'bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800 text-white border border-transparent focus-visible:ring-red-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white border border-transparent focus-visible:ring-blue-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:bg-amber-700 active:bg-amber-800 text-white border border-transparent focus-visible:ring-amber-500',
    default: 'bg-slate-700 hover:bg-slate-800 focus:bg-slate-800 active:bg-slate-900 text-white border border-transparent focus-visible:ring-slate-500'
  };
  
  const outlineColorClasses = {
    primary: 'border border-primary-600/70 bg-transparent hover:bg-primary-100/10 focus:bg-primary-100/10 active:bg-primary-100/20 text-primary-500 focus-visible:ring-primary-500',
    secondary: 'border border-secondary-600/70 bg-transparent hover:bg-secondary-100/10 focus:bg-secondary-100/10 active:bg-secondary-100/20 text-secondary-500 focus-visible:ring-secondary-500',
    success: 'border border-green-600/70 bg-transparent hover:bg-green-100/10 focus:bg-green-100/10 active:bg-green-100/20 text-green-500 focus-visible:ring-green-500',
    error: 'border border-red-600/70 bg-transparent hover:bg-red-100/10 focus:bg-red-100/10 active:bg-red-100/20 text-red-500 focus-visible:ring-red-500',
    info: 'border border-blue-600/70 bg-transparent hover:bg-blue-100/10 focus:bg-blue-100/10 active:bg-blue-100/20 text-blue-500 focus-visible:ring-blue-500',
    warning: 'border border-amber-600/70 bg-transparent hover:bg-amber-100/10 focus:bg-amber-100/10 active:bg-amber-100/20 text-amber-500 focus-visible:ring-amber-500',
    default: 'border border-slate-600 bg-transparent hover:bg-slate-100/10 focus:bg-slate-100/10 active:bg-slate-100/20 text-slate-400 focus-visible:ring-slate-500',
  };
  
  const ghostColorClasses = {
    primary: 'text-primary-600 hover:bg-primary-100/10 focus:bg-primary-100/10 active:bg-primary-100/20 bg-transparent border border-transparent focus-visible:ring-primary-500',
    secondary: 'text-secondary-600 hover:bg-secondary-100/10 focus:bg-secondary-100/10 active:bg-secondary-100/20 bg-transparent border border-transparent focus-visible:ring-secondary-500',
    success: 'text-green-600 hover:bg-green-100/10 focus:bg-green-100/10 active:bg-green-100/20 bg-transparent border border-transparent focus-visible:ring-green-500',
    error: 'text-red-600 hover:bg-red-100/10 focus:bg-red-100/10 active:bg-red-100/20 bg-transparent border border-transparent focus-visible:ring-red-500',
    info: 'text-blue-600 hover:bg-blue-100/10 focus:bg-blue-100/10 active:bg-blue-100/20 bg-transparent border border-transparent focus-visible:ring-blue-500',
    warning: 'text-amber-600 hover:bg-amber-100/10 focus:bg-amber-100/10 active:bg-amber-100/20 bg-transparent border border-transparent focus-visible:ring-amber-500',
    default: 'text-slate-400 hover:bg-slate-800 focus:bg-slate-800 active:bg-slate-700 bg-transparent border border-transparent focus-visible:ring-slate-500',
  };
  
  const glassColorClasses = {
    primary: 'bg-primary-500/20 backdrop-filter backdrop-blur-sm text-primary-700 dark:text-primary-300 hover:bg-primary-500/30 focus:bg-primary-500/30 active:bg-primary-500/40 border border-primary-500/30 dark:border-primary-700/30 focus-visible:ring-primary-500',
    secondary: 'bg-secondary-500/20 backdrop-filter backdrop-blur-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-500/30 focus:bg-secondary-500/30 active:bg-secondary-500/40 border border-secondary-500/30 dark:border-secondary-700/30 focus-visible:ring-secondary-500',
    success: 'bg-green-500/20 backdrop-filter backdrop-blur-sm text-green-700 dark:text-green-300 hover:bg-green-500/30 focus:bg-green-500/30 active:bg-green-500/40 border border-green-500/30 dark:border-green-700/30 focus-visible:ring-green-500',
    error: 'bg-red-500/20 backdrop-filter backdrop-blur-sm text-red-700 dark:text-red-300 hover:bg-red-500/30 focus:bg-red-500/30 active:bg-red-500/40 border border-red-500/30 dark:border-red-700/30 focus-visible:ring-red-500',
    info: 'bg-blue-500/20 backdrop-filter backdrop-blur-sm text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 focus:bg-blue-500/30 active:bg-blue-500/40 border border-blue-500/30 dark:border-blue-700/30 focus-visible:ring-blue-500',
    warning: 'bg-amber-500/20 backdrop-filter backdrop-blur-sm text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 focus:bg-amber-500/30 active:bg-amber-500/40 border border-amber-500/30 dark:border-amber-700/30 focus-visible:ring-amber-500',
    default: 'bg-white/10 backdrop-filter backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:bg-white/20 focus:bg-white/20 active:bg-white/30 border border-white/30 dark:border-slate-700/30 focus-visible:ring-slate-500',
  };
  
  // Classes based on variant
  const variantClasses = {
    primary: colorClasses[color],
    secondary: colorClasses.secondary,
    outline: outlineColorClasses[color],
    danger: colorClasses.error,
    text: 'bg-transparent hover:bg-slate-100/10 focus:bg-slate-100/10 active:bg-slate-100/20 text-primary-500 border border-transparent focus-visible:ring-primary-500',
    contained: colorClasses[color],
    outlined: outlineColorClasses[color],
    ghost: ghostColorClasses[color],
    glass: glassColorClasses[color]
  };
  
  // Classes based on size
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs gap-1.5',
    medium: 'px-4 py-2 text-sm gap-2',
    large: 'px-5 py-2.5 text-base gap-2',
    icon: 'p-2'
  };
  
  // Disabled and loading state classes
  const stateClasses = (disabled || isLoading) 
    ? 'opacity-70 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.width) inlineStyle.width = sx.width;
  if (sx.minWidth) inlineStyle.minWidth = sx.minWidth;
  if (sx.maxWidth) inlineStyle.maxWidth = sx.maxWidth;
  if (sx.height) inlineStyle.height = sx.height;
  if (sx.minHeight) inlineStyle.minHeight = sx.minHeight;
  if (sx.maxHeight) inlineStyle.maxHeight = sx.maxHeight;
  if (sx.mt) inlineStyle.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.ml) inlineStyle.marginLeft = `${sx.ml * 0.25}rem`;
  if (sx.mr) inlineStyle.marginRight = `${sx.mr * 0.25}rem`;
  if (sx.mx) inlineStyle.marginLeft = inlineStyle.marginRight = `${sx.mx * 0.25}rem`;
  if (sx.my) inlineStyle.marginTop = inlineStyle.marginBottom = `${sx.my * 0.25}rem`;
  if (sx.m) inlineStyle.margin = `${sx.m * 0.25}rem`;
  
  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[mappedVariant]}
        ${sizeClasses[size]}
        ${stateClasses}
        ${widthClass}
        ${radiusClasses}
        ${className}
      `}
      disabled={disabled || isLoading}
      style={inlineStyle}
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </>
      ) : (
        <>
          {startIcon && (
            <span className="inline-flex">{startIcon}</span>
          )}
          
          {children}
          
          {endIcon && (
            <span className="inline-flex">{endIcon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button; 