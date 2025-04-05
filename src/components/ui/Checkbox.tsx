import React, { forwardRef, useRef } from 'react';
import { useToggleState } from 'react-stately';
import { useCheckbox } from 'react-aria';
import type { AriaCheckboxProps } from 'react-aria';

interface CheckboxProps extends Omit<AriaCheckboxProps, 'children'> {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  sx?: Record<string, any>;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  color = 'primary',
  size = 'medium',
  className = '',
  sx = {},
  ...ariaProps
}, forwardedRef) => {
  const state = useToggleState(ariaProps);
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps } = useCheckbox(ariaProps, state, ref);

  const sizeClass = size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-6 w-6' : 'h-5 w-5';

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

  const inlineStyle: React.CSSProperties = {};
  if (sx.margin) inlineStyle.margin = sx.margin;
  if (sx.marginLeft) inlineStyle.marginLeft = sx.marginLeft;
  if (sx.marginRight) inlineStyle.marginRight = sx.marginRight;
  if (sx.marginTop) inlineStyle.marginTop = sx.marginTop;
  if (sx.marginBottom) inlineStyle.marginBottom = sx.marginBottom;

  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

  return (
    <input
      type="checkbox"
      ref={ref}
      {...inputProps}
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
    />
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox; 