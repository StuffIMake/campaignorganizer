import React, { forwardRef, useState } from 'react';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  margin?: 'none' | 'dense' | 'normal';
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    className?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  };
  InputLabelProps?: {
    shrink?: boolean;
    className?: string;
  };
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  sx?: Record<string, any>;
}

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(({
  label,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  error = false,
  required = false,
  disabled = false,
  className = '',
  margin = 'normal',
  InputProps = {},
  InputLabelProps = {},
  multiline = false,
  rows = 1,
  maxRows,
  sx = {},
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  
  // Generate unique ID if not provided
  const inputId = id || `textfield-${Math.random().toString(36).substring(2, 9)}`;
  
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
  if (sx.width) inlineStyle.width = typeof sx.width === 'number' ? `${sx.width}px` : sx.width;
  
  // Handle fullWidth
  if (fullWidth) {
    inlineStyle.width = '100%';
  }
  
  // Handle margin
  const marginClasses = {
    none: '',
    dense: 'my-1',
    normal: 'my-2'
  }[margin];
  
  // Handle variant classes
  const variantClasses = {
    outlined: 'border rounded-md border-slate-600',
    filled: 'border-b rounded-t-md bg-slate-800 border-slate-600',
    standard: 'border-b border-slate-600'
  }[variant];
  
  // Handle size
  const sizeClasses = size === 'small' ? 'text-sm' : 'text-base';
  
  // Handle states
  const stateClasses = [
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
    error ? 'border-red-500' : (focused ? 'border-primary-500' : ''),
    focused ? 'ring-1 ring-primary-500' : ''
  ].join(' ');
  
  // Handle label floating
  const shouldShrink = InputLabelProps.shrink !== undefined 
    ? InputLabelProps.shrink 
    : focused || hasValue;
  
  const labelPositionClass = shouldShrink
    ? 'text-xs transform -translate-y-6 top-2'
    : 'text-base top-1/2 -translate-y-1/2';
  
  const labelSizeClass = size === 'small' ? 'text-xs' : 'text-sm';
  
  // Handle input change to track if it has value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  
  // Calculate textarea height based on rows and maxRows
  const textareaStyle: React.CSSProperties = {};
  if (multiline) {
    textareaStyle.minHeight = `${rows * 1.5}rem`;
    if (maxRows) {
      textareaStyle.maxHeight = `${maxRows * 1.5}rem`;
    }
  }
  
  return (
    <div 
      ref={ref}
      className={`relative inline-block ${fullWidth ? 'w-full' : ''} ${marginClasses} ${className}`}
      style={inlineStyle}
    >
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            absolute left-3 transition-all duration-200 
            ${labelPositionClass} 
            ${labelSizeClass}
            ${error ? 'text-red-500' : focused ? 'text-primary-400' : 'text-slate-400'}
            ${disabled ? 'text-gray-400' : ''}
            ${shouldShrink && variant !== 'standard' ? 'bg-white px-1' : ''}
            ${InputLabelProps.className || ''}
          `}
        >
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <div className={`relative ${variantClasses}`}>
        {InputProps.startAdornment && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {InputProps.startAdornment}
          </div>
        )}
        
        <input
          {...props}
          {...InputProps.inputProps}
          id={inputId}
          className={`
            w-full bg-transparent focus:outline-none py-2 px-3
            ${sizeClasses}
            ${stateClasses}
            ${InputProps.startAdornment ? 'pl-10' : ''}
            ${InputProps.endAdornment ? 'pr-10' : ''}
            ${InputProps.className || ''}
          `}
          disabled={disabled}
          required={required}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          onChange={handleChange}
        />
        
        {InputProps.endAdornment && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {InputProps.endAdornment}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-slate-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField; 