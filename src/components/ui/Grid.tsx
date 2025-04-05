import React, { forwardRef } from 'react';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | true | 'auto';
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | true | 'auto';
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | true | 'auto';
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | true | 'auto';
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | true | 'auto';
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  className?: string;
  sx?: Record<string, any>;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(({
  children,
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing = 0,
  className = '',
  sx = {},
  ...rest
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
  
  // Container classes
  const containerClasses = container ? 'flex flex-wrap' : '';
  
  // Spacing classes
  const spacingClasses = container ? {
    0: '',
    1: '-m-1',
    2: '-m-2',
    3: '-m-3',
    4: '-m-4',
    5: '-m-5',
    6: '-m-6',
    7: '-m-7',
    8: '-m-8',
    9: '-m-9',
    10: '-m-10'
  }[spacing] : item ? {
    0: '',
    1: 'p-1',
    2: 'p-2',
    3: 'p-3',
    4: 'p-4',
    5: 'p-5',
    6: 'p-6',
    7: 'p-7',
    8: 'p-8',
    9: 'p-9',
    10: 'p-10'
  }[spacing] : '';
  
  // Generate grid item width classes
  const getWidthClass = (breakpoint: string, value: any) => {
    if (value === true) return `${breakpoint}:flex-grow`;
    if (value === 'auto') return `${breakpoint}:w-auto`;
    
    const widths: Record<number, string> = {
      1: '1/12',
      2: '2/12',
      3: '1/4',
      4: '1/3',
      5: '5/12',
      6: '1/2',
      7: '7/12',
      8: '2/3',
      9: '3/4',
      10: '10/12',
      11: '11/12',
      12: 'full'
    };
    
    return value ? `${breakpoint === '' ? '' : `${breakpoint}:`}w-${widths[value as number] || 'full'}` : '';
  };
  
  // Generate responsive width classes
  const xsClass = getWidthClass('', xs);
  const smClass = getWidthClass('sm', sm);
  const mdClass = getWidthClass('md', md);
  const lgClass = getWidthClass('lg', lg);
  const xlClass = getWidthClass('xl', xl);
  
  return (
    <div
      ref={ref}
      className={`
        ${containerClasses}
        ${spacingClasses}
        ${item ? xsClass : ''}
        ${item ? smClass : ''}
        ${item ? mdClass : ''}
        ${item ? lgClass : ''}
        ${item ? xlClass : ''}
        ${className}
      `.trim()}
      style={{ ...inlineStyle, ...rest.style }}
      {...rest}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

export default Grid; 