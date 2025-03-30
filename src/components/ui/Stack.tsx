import React, { forwardRef } from 'react';
import Box from './Box';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  spacing?: number;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  className?: string;
  sx?: Record<string, any>;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(({
  children,
  direction = 'column',
  spacing = 0,
  alignItems,
  justifyContent,
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
  if (sx.p) inlineStyle.padding = `${sx.p * 0.25}rem`;
  if (sx.pt) inlineStyle.paddingTop = `${sx.pt * 0.25}rem`;
  if (sx.pb) inlineStyle.paddingBottom = `${sx.pb * 0.25}rem`;
  if (sx.pl) inlineStyle.paddingLeft = `${sx.pl * 0.25}rem`;
  if (sx.pr) inlineStyle.paddingRight = `${sx.pr * 0.25}rem`;
  if (sx.px) inlineStyle.paddingLeft = inlineStyle.paddingRight = `${sx.px * 0.25}rem`;
  if (sx.py) inlineStyle.paddingTop = inlineStyle.paddingBottom = `${sx.py * 0.25}rem`;
  
  // Calculate spacing value in rem
  const spacingValue = `${spacing * 0.25}rem`;
  
  // Combine all styles
  const combinedSx = {
    display: 'flex',
    flexDirection: direction,
    gap: spacingValue,
    ...(alignItems && { alignItems }),
    ...(justifyContent && { justifyContent }),
    ...sx
  };
  
  return (
    <Box
      ref={ref}
      className={`stack ${className}`}
      sx={combinedSx}
      {...props}
    >
      {children}
    </Box>
  );
});

Stack.displayName = 'Stack';

export default Stack; 