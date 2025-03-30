import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  size?: 'small' | 'medium' | 'large';
  indeterminate?: boolean;
  sx?: Record<string, any>;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    checked = false,
    onChange,
    color = 'primary',
    size = 'medium',
    indeterminate = false,
    className = '',
    sx = {},
    ...props
  }, ref) => {
    // Size classes
    const sizeClass = size === 'small' 
      ? 'h-4 w-4' 
      : size === 'large' 
        ? 'h-6 w-6' 
        : 'h-5 w-5';

    // Color classes for the checked state
    let colorClass = '';
    switch (color) {
      case 'primary':
        colorClass = 'focus:ring-primary-500 text-primary-500';
        break;
      case 'secondary':
        colorClass = 'focus:ring-secondary-500 text-secondary-500';
        break;
      case 'error':
        colorClass = 'focus:ring-red-500 text-red-500';
        break;
      case 'warning':
        colorClass = 'focus:ring-yellow-500 text-yellow-500';
        break;
      case 'info':
        colorClass = 'focus:ring-blue-500 text-blue-500';
        break;
      case 'success':
        colorClass = 'focus:ring-green-500 text-green-500';
        break;
      default:
        colorClass = 'focus:ring-slate-500 text-slate-500';
    }

    // Convert sx props to inline styles
    const inlineStyle: React.CSSProperties = {};
    if (sx.margin) inlineStyle.margin = sx.margin;
    if (sx.marginLeft) inlineStyle.marginLeft = sx.marginLeft;
    if (sx.marginRight) inlineStyle.marginRight = sx.marginRight;
    if (sx.marginTop) inlineStyle.marginTop = sx.marginTop;
    if (sx.marginBottom) inlineStyle.marginBottom = sx.marginBottom;

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        className={`
          ${sizeClass}
          ${colorClass}
          bg-white dark:bg-slate-800 
          border-gray-300 dark:border-gray-600 
          rounded 
          focus:ring-2 focus:ring-offset-2 
          dark:focus:ring-offset-slate-900
          transition-colors
          ${className}
        `}
        style={inlineStyle}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 