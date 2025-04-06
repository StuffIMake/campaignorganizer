import React, { forwardRef, useCallback } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  className?: string;
  edge?: 'start' | 'end';
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  sx?: Record<string, any>;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  size = 'medium',
  color = 'primary',
  className = '',
  edge,
  inputProps = {},
  sx = {},
  ...props
}, ref) => {
  // Debug render
  console.log('Switch rendering with checked=', checked);
  
  // Create a stable onChange handler that logs to help debug
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Switch handleChange called with checked=', e.target.checked);
    if (onChange) {
      onChange(e);
    }
  }, [onChange]);
  
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
  const switchWidth = size === 'small' ? 'w-8' : 'w-10';
  const switchHeight = size === 'small' ? 'h-4' : 'h-5';
  const thumbSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
  const thumbTranslate = size === 'small' ? 'translate-x-4' : 'translate-x-5';
  
  // Handle color
  const colorClasses: Record<string, string> = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-sky-500',
    success: 'bg-green-500'
  };
  
  // Handle edge spacing
  const edgeClasses: Record<string, string> = {
    start: '-ml-2',
    end: '-mr-2'
  };
  
  return (
    <label
      className={`
        inline-flex items-center relative
        ${edge ? edgeClasses[edge] : ''}
        ${className}
      `}
      style={inlineStyle}
    >
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only peer"
        {...inputProps}
        {...props}
      />
      <div
        className={`
          ${switchWidth} ${switchHeight} rounded-full
          flex items-center transition-colors duration-200 ease-in-out
          bg-gray-200 peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-white
          peer-focus:ring-opacity-50
          peer-checked:${colorClasses[color]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            ${thumbSize} bg-white rounded-full shadow transform
            transition-transform duration-200 ease-in-out
            peer-checked:${thumbTranslate}
            ${size === 'small' ? 'ml-0.5' : 'ml-0.5'}
          `}
        ></span>
      </div>
    </label>
  );
});

Switch.displayName = 'Switch';

export default Switch; 