import React, { forwardRef } from 'react';

// Card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  variant?: 'elevation' | 'outlined' | 'filled' | 'glass';
  sx?: Record<string, any>;
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  elevation = 1,
  variant = 'elevation',
  hover = false,
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
  
  // Elevation classes with improved shadows
  const elevationClasses = variant === 'elevation' ? {
    0: '',
    1: 'shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50',
    2: 'shadow ring-1 ring-slate-200/50 dark:ring-slate-800/50',
    3: 'shadow-md ring-1 ring-slate-200/50 dark:ring-slate-800/50',
    4: 'shadow-lg',
    5: 'shadow-xl'
  }[elevation] : '';
  
  // Variant classes with better styling
  let variantClasses = '';
  if (variant === 'outlined') {
    variantClasses = 'border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm';
  } else if (variant === 'filled') {
    variantClasses = 'bg-slate-50 dark:bg-slate-800/90';
  } else if (variant === 'glass') {
    variantClasses = 'bg-white/10 dark:bg-slate-900/20 backdrop-filter backdrop-blur-md border border-white/20 dark:border-slate-700/30';
  } else {
    variantClasses = 'bg-white dark:bg-slate-900';
  }
  
  // Hover effect classes
  const hoverClasses = hover ? 'transform transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md' : '';
  
  return (
    <div
      ref={ref}
      className={`
        rounded-xl
        overflow-hidden
        transition-all
        duration-200
        ${elevationClasses}
        ${variantClasses}
        ${hoverClasses}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// CardHeader component
interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  divider?: boolean;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  title,
  subheader,
  avatar,
  action,
  divider = true,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  const borderClass = divider ? 'border-b border-slate-100 dark:border-slate-800' : '';
  
  return (
    <div
      ref={ref}
      className={`
        flex items-center px-5 py-4 ${borderClass}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {avatar && (
        <div className="mr-4 flex-shrink-0">
          {avatar}
        </div>
      )}
      <div className="flex-grow min-w-0">
        {title && (
          <div className="text-lg font-medium text-slate-900 dark:text-white truncate">
            {title}
          </div>
        )}
        {subheader && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {subheader}
          </div>
        )}
      </div>
      {action && (
        <div className="ml-auto flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

// CardContent component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  children,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  return (
    <div
      ref={ref}
      className={`px-5 py-4 last:pb-6 ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

// CardMedia component
interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: 'div' | 'img';
  image?: string;
  src?: string;
  alt?: string;
  height?: number | string;
  className?: string;
  sx?: Record<string, any>;
  overlay?: React.ReactNode;
}

const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(({
  component = 'div',
  image,
  src,
  alt = '',
  height,
  overlay,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Set height if provided
  if (height) {
    inlineStyle.height = typeof height === 'number' ? `${height}px` : height;
  }
  
  // Use image or src prop (image takes precedence)
  const imgSrc = image || src;
  
  if (component === 'img') {
    return (
      <div className="relative">
        <img
          ref={ref as React.Ref<HTMLImageElement>}
          src={imgSrc}
          alt={alt}
          className={`w-full object-cover ${className}`}
          style={inlineStyle}
          {...props as React.ImgHTMLAttributes<HTMLImageElement>}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-4 text-white w-full">{overlay}</div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div
      ref={ref}
      className={`bg-cover bg-center relative ${className}`}
      style={{
        ...inlineStyle,
        backgroundImage: imgSrc ? `url(${imgSrc})` : undefined
      }}
      {...props}
    >
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white w-full">{overlay}</div>
        </div>
      )}
    </div>
  );
});

CardMedia.displayName = 'CardMedia';

// CardActions component
interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  disableSpacing?: boolean;
  sx?: Record<string, any>;
  divider?: boolean;
}

const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(({
  children,
  className = '',
  disableSpacing = false,
  divider = true,
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  const borderClass = divider ? 'border-t border-slate-100 dark:border-slate-800' : '';
  
  return (
    <div
      ref={ref}
      className={`
        flex items-center px-4 py-3 ${borderClass}
        ${disableSpacing ? '' : 'gap-2'}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
});

CardActions.displayName = 'CardActions';

export {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions
}; 