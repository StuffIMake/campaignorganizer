import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  sx?: Record<string, any>;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
  sx = {}
}) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Handle commonly used sx properties
  if (sx.my) inlineStyle.margin = `${sx.my * 0.25}rem 0`;
  if (sx.mx) inlineStyle.margin = `0 ${sx.mx * 0.25}rem`;
  if (sx.m) inlineStyle.margin = `${sx.m * 0.25}rem`;
  
  const orientationClass = 
    orientation === 'horizontal' 
      ? 'w-full border-t' 
      : 'h-full border-l';
  
  return (
    <hr
      className={`
        border-slate-700/30
        ${orientationClass}
        ${className}
      `}
      style={inlineStyle}
    />
  );
};

export default Divider; 