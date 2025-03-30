import React, { forwardRef } from 'react';

interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'extended';
  className?: string;
  sx?: Record<string, any>;
}

const Fab = forwardRef<HTMLButtonElement, FabProps>(({
  children,
  color = 'primary',
  size = 'medium',
  variant = 'circular',
  className = '',
  sx = {},
  ...props
}, ref) => {
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
  if (sx.bottom) inlineStyle.bottom = sx.bottom;
  if (sx.right) inlineStyle.right = sx.right;
  if (sx.left) inlineStyle.left = sx.left;
  if (sx.top) inlineStyle.top = sx.top;
  if (sx.position) inlineStyle.position = sx.position;
  if (sx.zIndex) inlineStyle.zIndex = sx.zIndex;

  // Size classes
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-14 h-14 text-base',
    large: 'w-16 h-16 text-lg'
  }[size];

  // Variant classes
  const variantClasses = {
    circular: 'rounded-full aspect-square',
    extended: 'rounded-full px-4'
  }[variant];

  // Color classes
  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
    info: 'bg-sky-600 hover:bg-sky-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white'
  }[color];

  return (
    <button
      ref={ref}
      className={`
        flex items-center justify-center
        shadow-lg
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-${color}-500
        disabled:opacity-50 disabled:pointer-events-none
        ${sizeClasses}
        ${variantClasses}
        ${colorClasses}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {children}
    </button>
  );
});

Fab.displayName = 'Fab';

export default Fab; 