import React, { forwardRef } from 'react';

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  sx?: Record<string, any>;
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(({
  children,
  className = '',
  fullWidth = false,
  required = false,
  disabled = false,
  error = false,
  sx = {},
  ...props
}, ref) => {
  // Handle sx props
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.mt) inlineStyle.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mx) inlineStyle.marginLeft = inlineStyle.marginRight = `${sx.mx * 0.25}rem`;
  if (sx.my) inlineStyle.marginTop = inlineStyle.marginBottom = `${sx.my * 0.25}rem`;
  
  return (
    <div
      ref={ref}
      className={`
        relative
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-70 pointer-events-none' : ''}
        ${error ? 'text-red-500' : ''}
        ${className}
      `}
      data-required={required}
      data-disabled={disabled}
      data-error={error}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
});

FormControl.displayName = 'FormControl';

interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  shrink?: boolean;
}

const InputLabel = forwardRef<HTMLLabelElement, InputLabelProps>(({
  children,
  className = '',
  required = false,
  disabled = false,
  error = false,
  shrink = false,
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      className={`
        block mb-2 text-sm font-medium
        ${error ? 'text-red-500' : 'text-slate-900 dark:text-white'}
        ${disabled ? 'opacity-70 pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
});

InputLabel.displayName = 'InputLabel';

export default FormControl;
export { InputLabel }; 