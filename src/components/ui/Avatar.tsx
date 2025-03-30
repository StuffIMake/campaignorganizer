import React, { forwardRef } from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  alt?: string;
  src?: string;
  children?: React.ReactNode;
  variant?: 'circular' | 'rounded' | 'square';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  sx?: Record<string, any>;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({
  alt,
  src,
  children,
  variant = 'circular',
  size = 'medium',
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.mt) inlineStyle.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.ml) inlineStyle.marginLeft = `${sx.ml * 0.25}rem`;
  if (sx.mr) inlineStyle.marginRight = `${sx.mr * 0.25}rem`;
  if (sx.mx) inlineStyle.marginLeft = inlineStyle.marginRight = `${sx.mx * 0.25}rem`;
  if (sx.my) inlineStyle.marginTop = inlineStyle.marginBottom = `${sx.my * 0.25}rem`;
  if (sx.m) inlineStyle.margin = `${sx.m * 0.25}rem`;
  
  // Handle size
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base'
  }[size];
  
  // Handle variant
  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-md',
    square: 'rounded-none'
  }[variant];
  
  // Generate initials if no src and no children
  const getInitials = () => {
    if (!alt) return '';
    
    const words = alt.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div
      ref={ref}
      className={`
        flex items-center justify-center
        overflow-hidden bg-gray-300 text-gray-600 font-medium
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      aria-label={alt}
      style={inlineStyle}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt || 'avatar'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Remove src when image fails to load
            (e.target as HTMLImageElement).src = '';
          }}
        />
      ) : children ? (
        children
      ) : (
        getInitials()
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar; 