import React from 'react';

interface CircularProgressProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'default';
  thickness?: number;
  className?: string;
  sx?: Record<string, any>;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 40,
  color = 'primary',
  thickness = 3.6,
  className = '',
  sx = {}
}) => {
  // Handle sx props
  const inlineStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    ...sx
  };

  // Color classes
  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    default: 'border-slate-200'
  };

  return (
    <div 
      className={`
        inline-block 
        rounded-full 
        border-solid 
        animate-spin 
        ${colorClasses[color]}
        ${className}
      `}
      style={{
        borderWidth: `${thickness}px`,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        ...inlineStyle
      }}
      role="progressbar"
    />
  );
};

export default CircularProgress; 