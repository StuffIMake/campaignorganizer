import React, { forwardRef } from 'react';

interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  elevation?: number;
  variant?: 'elevation' | 'outlined';
  sx?: Record<string, any>; 
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ 
    children, 
    className = '', 
    elevation = 1, 
    variant = 'elevation',
    sx = {},
    ...rest 
  }, ref) => {
    
    const inlineStyle: React.CSSProperties = {};
    
    // Handle commonly used sx properties
    if (sx.display) inlineStyle.display = sx.display;
    if (sx.flexDirection) inlineStyle.flexDirection = sx.flexDirection;
    if (sx.alignItems) inlineStyle.alignItems = sx.alignItems;
    if (sx.justifyContent) inlineStyle.justifyContent = sx.justifyContent;
    if (sx.flexGrow !== undefined) inlineStyle.flexGrow = sx.flexGrow;
    if (sx.p) inlineStyle.padding = typeof sx.p === 'number' ? `${sx.p * 8}px` : sx.p;
    if (sx.width) inlineStyle.width = sx.width;
    if (sx.height) inlineStyle.height = sx.height;
    if (sx.minWidth) inlineStyle.minWidth = sx.minWidth;
    if (sx.maxWidth) inlineStyle.maxWidth = sx.maxWidth;
    if (sx.overflow) inlineStyle.overflow = sx.overflow;
    if (sx.overflowX) inlineStyle.overflowX = sx.overflowX;
    if (sx.overflowY) inlineStyle.overflowY = sx.overflowY;
    if (sx.bgcolor) inlineStyle.backgroundColor = sx.bgcolor;
    if (sx.zIndex !== undefined) inlineStyle.zIndex = sx.zIndex;
    
    // Styles based on elevation
    let elevationClass = '';
    if (variant === 'elevation') {
      switch (elevation) {
        case 0:
          elevationClass = '';
          break;
        case 1:
          elevationClass = 'shadow-md';
          break;
        case 2:
          elevationClass = 'shadow-lg';
          break;
        case 3:
          elevationClass = 'shadow-xl';
          break;
        default:
          elevationClass = 'shadow-2xl';
      }
    }
    
    const variantClass = variant === 'outlined' ? 'border border-slate-700/50' : '';
    
    return (
      <div
        ref={ref}
        className={`paper glass-effect rounded-[var(--radius-md)] ${elevationClass} ${variantClass} ${className}`}
        style={{
          ...inlineStyle,
          ...rest.style
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Paper.displayName = 'Paper';

export default Paper; 