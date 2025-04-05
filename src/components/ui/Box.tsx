import React, { forwardRef } from 'react';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  component?: React.ElementType;
  sx?: Record<string, any>;
  className?: string;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(({
  children,
  component: Component = 'div',
  sx = {},
  className = '',
  // ...rest captures all props NOT explicitly destructured above
  ...rest 
}, ref) => {

  // Convert sx props (using the sx object directly) to inline styles and class names
  const inlineStyle: React.CSSProperties = {};
  let generatedClasses = '';
  
  // Responsive utilities
  if (sx.display) {
    if (typeof sx.display === 'object') {
      // Handle responsive display
      if (sx.display.xs) generatedClasses += ` ${sx.display.xs}`;
      if (sx.display.sm) generatedClasses += ` sm:${sx.display.sm}`;
      if (sx.display.md) generatedClasses += ` md:${sx.display.md}`;
      if (sx.display.lg) generatedClasses += ` lg:${sx.display.lg}`;
      if (sx.display.xl) generatedClasses += ` xl:${sx.display.xl}`;
    } else {
      // Simple display
      generatedClasses += ` ${sx.display}`;
    }
  }

  // Flexbox utilities
  if (sx.flexDirection) {
    if (typeof sx.flexDirection === 'object') {
      // Handle responsive flex-direction
      if (sx.flexDirection.xs) generatedClasses += ` flex-${sx.flexDirection.xs}`;
      if (sx.flexDirection.sm) generatedClasses += ` sm:flex-${sx.flexDirection.sm}`;
      if (sx.flexDirection.md) generatedClasses += ` md:flex-${sx.flexDirection.md}`;
      if (sx.flexDirection.lg) generatedClasses += ` lg:flex-${sx.flexDirection.lg}`;
      if (sx.flexDirection.xl) generatedClasses += ` xl:flex-${sx.flexDirection.xl}`;
    } else {
      // Simple flex-direction
      generatedClasses += ` flex-${sx.flexDirection}`;
    }
  }

  // Justify content and align items
  if (sx.justifyContent) {
    generatedClasses += ` justify-${sx.justifyContent.replace('flex-', '')}`;
  }
  
  if (sx.alignItems) {
    generatedClasses += ` items-${sx.alignItems.replace('flex-', '')}`;
  }
  
  // Spacing utilities with responsive support
  const spacingProps = ['m', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'];
  
  spacingProps.forEach(prop => {
    if (sx[prop] !== undefined) {
      if (typeof sx[prop] === 'object') {
        // Handle responsive spacing
        for (const breakpoint in sx[prop]) {
          const value = sx[prop][breakpoint];
          const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
          
          // Convert prop to Tailwind format (m-4, px-2, etc.)
          const tailwindClass = `${prefix}${prop}-${value}`;
          generatedClasses += ` ${tailwindClass}`;
        }
      } else {
        // Simple spacing
        const spacingValue = sx[prop];
        if (prop === 'm') inlineStyle.margin = `${spacingValue * 0.25}rem`;
        if (prop === 'mt') inlineStyle.marginTop = `${spacingValue * 0.25}rem`;
        if (prop === 'mr') inlineStyle.marginRight = `${spacingValue * 0.25}rem`;
        if (prop === 'mb') inlineStyle.marginBottom = `${spacingValue * 0.25}rem`;
        if (prop === 'ml') inlineStyle.marginLeft = `${spacingValue * 0.25}rem`;
        if (prop === 'mx') {
          inlineStyle.marginLeft = `${spacingValue * 0.25}rem`;
          inlineStyle.marginRight = `${spacingValue * 0.25}rem`;
        }
        if (prop === 'my') {
          inlineStyle.marginTop = `${spacingValue * 0.25}rem`;
          inlineStyle.marginBottom = `${spacingValue * 0.25}rem`;
        }
        if (prop === 'p') inlineStyle.padding = `${spacingValue * 0.25}rem`;
        if (prop === 'pt') inlineStyle.paddingTop = `${spacingValue * 0.25}rem`;
        if (prop === 'pr') inlineStyle.paddingRight = `${spacingValue * 0.25}rem`;
        if (prop === 'pb') inlineStyle.paddingBottom = `${spacingValue * 0.25}rem`;
        if (prop === 'pl') inlineStyle.paddingLeft = `${spacingValue * 0.25}rem`;
        if (prop === 'px') {
          inlineStyle.paddingLeft = `${spacingValue * 0.25}rem`;
          inlineStyle.paddingRight = `${spacingValue * 0.25}rem`;
        }
        if (prop === 'py') {
          inlineStyle.paddingTop = `${spacingValue * 0.25}rem`;
          inlineStyle.paddingBottom = `${spacingValue * 0.25}rem`;
        }
      }
    }
  });
  
  // Width, height, and basic display properties
  if (sx.width) inlineStyle.width = typeof sx.width === 'number' ? `${sx.width}px` : sx.width;
  if (sx.minWidth) inlineStyle.minWidth = typeof sx.minWidth === 'number' ? `${sx.minWidth}px` : sx.minWidth;
  if (sx.maxWidth) inlineStyle.maxWidth = typeof sx.maxWidth === 'number' ? `${sx.maxWidth}px` : sx.maxWidth;
  if (sx.height) inlineStyle.height = typeof sx.height === 'number' ? `${sx.height}px` : sx.height;
  if (sx.minHeight) inlineStyle.minHeight = typeof sx.minHeight === 'number' ? `${sx.minHeight}px` : sx.minHeight;
  if (sx.maxHeight) inlineStyle.maxHeight = typeof sx.maxHeight === 'number' ? `${sx.maxHeight}px` : sx.maxHeight;
  
  // Borders, colors, bg, and other styles
  if (sx.color) inlineStyle.color = sx.color;
  if (sx.backgroundColor) inlineStyle.backgroundColor = sx.backgroundColor;
  if (sx.border) inlineStyle.border = sx.border;
  if (sx.borderTop) inlineStyle.borderTop = sx.borderTop;
  if (sx.borderRight) inlineStyle.borderRight = sx.borderRight;
  if (sx.borderBottom) inlineStyle.borderBottom = sx.borderBottom;
  if (sx.borderLeft) inlineStyle.borderLeft = sx.borderLeft;
  if (sx.borderRadius) inlineStyle.borderRadius = sx.borderRadius;
  if (sx.borderColor) inlineStyle.borderColor = sx.borderColor;
  if (sx.fontWeight) inlineStyle.fontWeight = sx.fontWeight;
  if (sx.fontSize) inlineStyle.fontSize = sx.fontSize;
  if (sx.textAlign) inlineStyle.textAlign = sx.textAlign;

  // Combine provided className with generated classes
  const allClassNames = `${className}${generatedClasses}`.trim();
  
  return (
    <Component
      ref={ref}
      className={allClassNames}
      style={{...inlineStyle, ...rest.style}} // Combine generated styles with passed styles
      // Spread the remaining props (rest) onto the component
      // This includes standard HTML attributes like 'id', 'aria-label', etc.
      // but excludes 'children', 'component', 'sx', 'className' which were handled
      {...rest}
      // Ensure 'style' from rest doesn't overwrite className/sx styles by placing it last
      // or merging style objects as done above
    >
      {children}
    </Component>
  );
});

Box.displayName = 'Box';

export default Box; 