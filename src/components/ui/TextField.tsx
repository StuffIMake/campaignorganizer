import React, { forwardRef, ChangeEvent, useState, useEffect, useRef } from 'react';
import { useTextField } from 'react-aria';
import type { AriaTextFieldProps } from 'react-aria';
import { ReactNode } from 'react';

// TextField props interface
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'onChange' | 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  multiline?: boolean;
  rows?: number;
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    inputProps?: object;
  };
  isRequired?: boolean;
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(({
  label,
  helperText,
  error = false,
  fullWidth = false,
  variant = 'outlined',
  multiline = false,
  rows = 3,
  InputProps,
  className = '',
  disabled = false,
  isRequired = false,
  onChange,
  value,
  size = 'medium',
  ...props
}, forwardedRef) => {
  // Local state to manage the input value for uncontrolled inputs
  const [inputValue, setInputValue] = useState(value || '');
  
  // Create internal refs for React Aria to use
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      // Special handling for Autocomplete components
      const isInAutocomplete = InputProps?.inputProps && 
        Object.keys(InputProps.inputProps).some(k => k.startsWith('aria-') && k.includes('combobox'));
      
      // In Autocomplete, only update from non-empty values
      if (isInAutocomplete) {
        if (value !== '') {
          setInputValue(value);
        }
      } else {
        // For regular TextFields: Always accept value prop changes
        setInputValue(value);
      }
    }
  }, [value, InputProps]);
  
  // Handle input value changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Update internal state for uncontrolled component behavior
    if (value === undefined) {
      setInputValue(newValue);
    }
    
    // Call parent onChange with the string value first, then the event
    if (onChange) {
      onChange(newValue, e);
    }
  };

  // Merge all input props for consistent handling
  const getInputProps = () => {
    // Start with the aria input props
    const baseProps = !multiline ? inputProps : {};
    
    // Handle value explicitly to avoid controlled component issues
    const valueProps = {
      value: value !== undefined ? value : inputValue,
      onChange: handleChange
    };
    
    return {
      ...baseProps,
      ...valueProps,
      ...(InputProps?.inputProps || {})
    };
  };
  
  // Map props for useTextField - only use for non-multiline
  const mappedProps: AriaTextFieldProps = {
    description: helperText,
    errorMessage: helperText,
    validationState: error ? 'invalid' : 'valid',
    isDisabled: disabled,
    label,
    // Ensure we have an aria-label if no visible label is provided
    'aria-label': !label && !props['aria-label'] && !props['aria-labelledby'] 
      ? (props.placeholder || 'text field') 
      : props['aria-label']
  };

  // Call useTextField hook only for input (not textarea)
  const { labelProps, inputProps, descriptionProps, errorMessageProps } = !multiline 
    ? useTextField(mappedProps, inputRef)
    : { labelProps: {}, inputProps: {}, descriptionProps: {}, errorMessageProps: {} };

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
  
  // Classes for the input field
  const inputClasses = `
    block px-2.5 pb-2.5 pt-4 w-full text-base
    bg-background-input dark:bg-background-input-dark
    border ${error ? 'border-red-500' : 'border-border-primary dark:border-border-primary-dark'} 
    rounded-lg
    focus:outline-none focus:ring-0
    ${error 
      ? 'focus:border-red-500' 
      : 'focus:border-primary dark:focus:border-primary-light'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    transition-all duration-200
  `;

  // Handle refs correctly
  React.useImperativeHandle(forwardedRef, () => {
    return multiline ? textareaRef.current! : inputRef.current!;
  });
  
  // If multiline, render a textarea
  if (multiline) {
    return (
      <div className={containerClasses}>
        {label && (
          <label
            className={`
              absolute text-sm text-text-secondary dark:text-text-secondary-dark z-10
              duration-300 transform -translate-y-4 scale-75 top-2 origin-[0] bg-background px-2 peer-focus:px-2 
              peer-focus:text-primary dark:peer-focus:text-primary-light
              ${error ? 'text-red-500 peer-focus:text-red-500' : ''}
              left-1
            `}
          >
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={textareaRef}
          className={inputClasses}
          rows={rows}
          onChange={handleChange}
          value={value !== undefined ? value : inputValue}
          disabled={disabled}
          aria-label={!label && !props['aria-label'] && !props['aria-labelledby'] 
            ? (props.placeholder || 'text area') 
            : props['aria-label']}
          {...props}
        />
        {helperText && (
          <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-text-secondary dark:text-text-secondary-dark'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
  
  // Otherwise render an input
  return (
    <div className={containerClasses}>
      {label && (
        <label
          {...labelProps}
          className={`
            absolute text-sm text-text-secondary dark:text-text-secondary-dark z-10
            duration-300 transform -translate-y-4 scale-75 top-2 origin-[0] bg-background px-2 peer-focus:px-2 
            peer-focus:text-primary dark:peer-focus:text-primary-light
            ${error ? 'text-red-500 peer-focus:text-red-500' : ''}
            left-1
          `}
        >
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {InputProps?.startAdornment && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {InputProps.startAdornment}
          </div>
        )}
        <input
          ref={inputRef}
          {...getInputProps()}
          className={`
            ${inputClasses}
            ${InputProps?.startAdornment ? 'pl-10' : ''}
            ${InputProps?.endAdornment ? 'pr-10' : ''}
          `}
          disabled={disabled}
          {...props}
        />
        {InputProps?.endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {InputProps.endAdornment}
          </div>
        )}
      </div>
      {helperText && (
        <p 
          {...(error ? errorMessageProps : descriptionProps)}
          className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-text-secondary dark:text-text-secondary-dark'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField; 