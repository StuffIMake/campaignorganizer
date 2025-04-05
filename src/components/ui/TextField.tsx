import React, { forwardRef, useRef } from 'react';
import { useTextField } from 'react-aria';
import type { AriaTextFieldProps } from 'react-aria';
import { ReactNode } from 'react';

// TextField props interface
export interface TextFieldProps extends Omit<AriaTextFieldProps, 'label'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  variant?: 'standard' | 'outlined' | 'filled' | 'glass';
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  };
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(({
  helperText,
  error = false,
  fullWidth = false,
  variant = 'outlined',
  className = '',
  InputProps,
  size = 'medium',
  ...ariaProps
}, ref) => {
  // Map props for useTextField
  const mappedProps: AriaTextFieldProps = {
    ...ariaProps,
    description: helperText,
    errorMessage: helperText,
    validationState: error ? 'invalid' : 'valid',
  };

  // Ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Call useTextField hook
  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
    mappedProps,
    inputRef
  );

  // Size classes
  const sizeMap = {
    small: {
      container: 'mb-3',
      label: 'text-xs mb-1',
      input: 'py-1.5 px-3 text-sm',
      helper: 'text-xs mt-1',
      adornment: 'h-4 w-4'
    },
    medium: {
      container: 'mb-4',
      label: 'text-sm mb-1.5',
      input: 'py-2 px-3 text-sm',
      helper: 'text-xs mt-1.5',
      adornment: 'h-5 w-5'
    },
    large: {
      container: 'mb-5',
      label: 'text-base mb-2',
      input: 'py-2.5 px-4 text-base',
      helper: 'text-sm mt-1.5',
      adornment: 'h-5 w-5'
    }
  }[size];
  
  // Container classes
  const containerClasses = `
    ${sizeMap.container}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();
  
  // Label classes
  const labelClasses = `
    block ${sizeMap.label} font-medium
    ${error ? 'text-red-500' : 'text-slate-300'}
  `.trim();
  
  // Helper/Error text classes
  const descriptionClasses = `
    ${sizeMap.helper}
    ${error ? 'text-red-500' : 'text-slate-400'}
  `.trim();
  
  // Base input classes
  let inputClasses = `
    block w-full appearance-none 
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-indigo-500/70 
    ${sizeMap.input}
    ${ariaProps.isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${InputProps?.startAdornment ? 'pl-10' : ''}
    ${InputProps?.endAdornment ? 'pr-10' : ''}
  `.trim();
  
  // Variant specific classes
  if (variant === 'outlined') {
    inputClasses += error
      ? ' border border-red-500 bg-red-500/5 focus:border-red-500 rounded-[var(--radius-md)] text-slate-300'
      : ' border border-slate-700 focus:border-indigo-500/70 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600 rounded-[var(--radius-md)] text-slate-300';
  } else if (variant === 'filled') {
    inputClasses += error
      ? ' border-b-2 border-red-500 bg-red-500/5 rounded-t-[var(--radius-md)] text-slate-300'
      : ' border-b-2 border-slate-700 focus:border-indigo-500/70 bg-slate-800/50 hover:bg-slate-800/70 rounded-t-[var(--radius-md)] text-slate-300';
  } else if (variant === 'glass') {
    inputClasses += error
      ? ' border border-red-500/50 bg-white/5 backdrop-blur-md rounded-[var(--radius-md)] text-slate-300 shadow-sm'
      : ' border border-white/10 focus:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[var(--radius-md)] text-slate-300 shadow-sm';
  } else {
    // Standard variant
    inputClasses += error
      ? ' border-b-2 border-red-500 bg-transparent hover:bg-slate-900/20 text-slate-300'
      : ' border-b-2 border-slate-700 focus:border-indigo-500/70 bg-transparent hover:bg-slate-900/20 text-slate-300';
  }
  
  // Input wrapper for adornments
  const inputWrapperClasses = 'relative';
  
  // Adornment positioning classes
  const startAdornmentClasses = `
    absolute left-3 top-1/2 transform -translate-y-1/2
    ${error ? 'text-red-500' : 'text-slate-400'}
    ${ariaProps.isDisabled ? 'opacity-60' : ''}
  `.trim();
  
  const endAdornmentClasses = `
    absolute right-3 top-1/2 transform -translate-y-1/2
    ${error ? 'text-red-500' : 'text-slate-400'}
    ${ariaProps.isDisabled ? 'opacity-60' : ''}
  `.trim();
  
  // Extract potential inputProps passed via InputProps (optional chaining)
  const nestedInputProps = InputProps?.inputProps || {};

  // Use useImperativeHandle to forward the external ref to the input element
  // This assumes the forwarded ref wants the input, not the outer div.
  // If the outer div is needed, adjust this or use a different pattern.
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  return (
    <div className={containerClasses} /* ref={ref} - Removed if ref targets input */ >
      {ariaProps.label && (
        <label {...labelProps} className={labelClasses}>
          {ariaProps.label}
        </label>
      )}
      
      <div className={inputWrapperClasses}>
        {InputProps?.startAdornment && (
          <div className={startAdornmentClasses}>
            {InputProps.startAdornment}
          </div>
        )}
        
        <input
          {...inputProps}
          {...nestedInputProps}
          ref={inputRef}
          className={inputClasses}
        />
        
        {InputProps?.endAdornment && (
          <div className={endAdornmentClasses}>
            {InputProps.endAdornment}
          </div>
        )}
      </div>
      
      {error && helperText ? (
        <p {...errorMessageProps} className={descriptionClasses}>
          {helperText}
        </p>
      ) : helperText ? (
        <p {...descriptionProps} className={descriptionClasses}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField; 