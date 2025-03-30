import React, { forwardRef } from 'react';

type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'subtitle1' 
  | 'subtitle2' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'button' 
  | 'overline';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: TypographyVariant;
  component?: React.ElementType;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | string;
  noWrap?: boolean;
  gutterBottom?: boolean;
  paragraph?: boolean;
  sx?: Record<string, any>; // For compatibility with Material UI style props
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ 
    children, 
    className = '', 
    variant = 'body1',
    component,
    color,
    noWrap = false,
    gutterBottom = false,
    paragraph = false,
    sx = {},
    ...props 
  }, ref) => {
    // Convert Material UI style sx object to inline style object
    const inlineStyle: React.CSSProperties = {};
    
    // Handle commonly used sx properties
    if (sx.display) inlineStyle.display = sx.display;
    if (sx.p) inlineStyle.padding = typeof sx.p === 'number' ? `${sx.p * 8}px` : sx.p;
    if (sx.m) inlineStyle.margin = typeof sx.m === 'number' ? `${sx.m * 8}px` : sx.m;
    if (sx.mt) inlineStyle.marginTop = typeof sx.mt === 'number' ? `${sx.mt * 8}px` : sx.mt;
    if (sx.mr) inlineStyle.marginRight = typeof sx.mr === 'number' ? `${sx.mr * 8}px` : sx.mr;
    if (sx.mb) inlineStyle.marginBottom = typeof sx.mb === 'number' ? `${sx.mb * 8}px` : sx.mb;
    if (sx.ml) inlineStyle.marginLeft = typeof sx.ml === 'number' ? `${sx.ml * 8}px` : sx.ml;
    
    // Map variant to appropriate element and classes
    const variantMapping: Record<TypographyVariant, { element: React.ElementType; classes: string }> = {
      h1: { element: 'h1', classes: 'text-4xl font-bold' },
      h2: { element: 'h2', classes: 'text-3xl font-bold' },
      h3: { element: 'h3', classes: 'text-2xl font-bold' },
      h4: { element: 'h4', classes: 'text-xl font-bold' },
      h5: { element: 'h5', classes: 'text-lg font-bold' },
      h6: { element: 'h6', classes: 'text-base font-bold' },
      subtitle1: { element: 'h6', classes: 'text-base font-medium' },
      subtitle2: { element: 'h6', classes: 'text-sm font-medium' },
      body1: { element: 'p', classes: 'text-base' },
      body2: { element: 'p', classes: 'text-sm' },
      caption: { element: 'span', classes: 'text-xs' },
      button: { element: 'span', classes: 'text-sm font-medium uppercase' },
      overline: { element: 'span', classes: 'text-xs font-medium uppercase tracking-wider' },
    };
    
    // Determine component to render
    const Component = component || (paragraph ? 'p' : variantMapping[variant].element);
    
    // Build class names
    const variantClass = variantMapping[variant].classes;
    const noWrapClass = noWrap ? 'whitespace-nowrap overflow-hidden text-ellipsis' : '';
    const gutterClass = gutterBottom ? 'mb-2' : '';
    const paragraphClass = paragraph ? 'mb-4' : '';
    
    // Handle color
    let colorClass = '';
    if (color) {
      switch (color) {
        case 'primary':
          colorClass = 'text-primary-400';
          break;
        case 'secondary':
          colorClass = 'text-secondary-500';
          break;
        case 'error':
          colorClass = 'text-red-500';
          break;
        case 'warning':
          colorClass = 'text-yellow-500';
          break;
        case 'info':
          colorClass = 'text-blue-500';
          break;
        case 'success':
          colorClass = 'text-green-500';
          break;
        default:
          inlineStyle.color = color;
      }
    }
    
    return (
      <Component
        ref={ref as any}
        className={`typography ${variantClass} ${noWrapClass} ${gutterClass} ${paragraphClass} ${colorClass} ${className}`}
        style={{
          ...props.style,
          ...inlineStyle
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

export default Typography; 