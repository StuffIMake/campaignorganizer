import React, { forwardRef } from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  edge?: 'start' | 'end' | false;
  className?: string;
  sx?: Record<string, any>; // For compatibility with Material UI style props
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  children,
  color = 'default',
  size = 'medium',
  disabled = false,
  edge = false,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert Material UI style sx object to inline style object
  const inlineStyle: React.CSSProperties = {};
  
  // Add any specific sx properties needed
  if (sx.m) inlineStyle.margin = typeof sx.m === 'number' ? `${sx.m * 8}px` : sx.m;
  if (sx.ml) inlineStyle.marginLeft = typeof sx.ml === 'number' ? `${sx.ml * 8}px` : sx.ml;
  if (sx.mr) inlineStyle.marginRight = typeof sx.mr === 'number' ? `${sx.mr * 8}px` : sx.mr;
  if (sx.mt) inlineStyle.marginTop = typeof sx.mt === 'number' ? `${sx.mt * 8}px` : sx.mt;
  if (sx.mb) inlineStyle.marginBottom = typeof sx.mb === 'number' ? `${sx.mb * 8}px` : sx.mb;
  
  // Size classes
  const sizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };
  
  // Color classes
  let colorClasses = '';
  switch (color) {
    case 'primary':
      colorClasses = 'text-primary-400 hover:bg-primary-900/30';
      break;
    case 'secondary':
      colorClasses = 'text-secondary-500 hover:bg-secondary-900/30';
      break;
    case 'error':
      colorClasses = 'text-red-500 hover:bg-red-900/30';
      break;
    case 'info':
      colorClasses = 'text-blue-500 hover:bg-blue-900/30';
      break;
    case 'success':
      colorClasses = 'text-green-500 hover:bg-green-900/30';
      break;
    case 'warning':
      colorClasses = 'text-yellow-500 hover:bg-yellow-900/30';
      break;
    default:
      colorClasses = 'text-slate-300 hover:bg-slate-700/50';
  }
  
  // Edge classes (for proper spacing in NavBar)
  const edgeClasses: Record<string, string> = {
    'start': '-ml-2',
    'end': '-mr-2',
    'false': ''
  };
  
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={`
        rounded-full
        ${sizeClasses[size]}
        ${colorClasses}
        ${edge ? edgeClasses[edge] : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton; 