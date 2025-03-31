import React, { forwardRef } from 'react';

// TextField props interface
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  variant?: 'standard' | 'outlined' | 'filled' | 'glass';
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
  size?: 'small' | 'medium' | 'large';
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  helperText,
  error = false,
  fullWidth = false,
  variant = 'outlined',
  className = '',
  placeholder,
  disabled = false,
  required = false,
  InputProps,
  size = 'medium',
  ...props
}, ref) => {
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
  
  // Helper text classes
  const helperTextClasses = `
    ${sizeMap.helper}
    ${error ? 'text-red-500' : 'text-slate-400'}
  `.trim();
  
  // Base input classes
  let inputClasses = `
    block w-full appearance-none 
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-indigo-500/70 
    ${sizeMap.input}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
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
    ${disabled ? 'opacity-60' : ''}
  `.trim();
  
  const endAdornmentClasses = `
    absolute right-3 top-1/2 transform -translate-y-1/2
    ${error ? 'text-red-500' : 'text-slate-400'}
    ${disabled ? 'opacity-60' : ''}
  `.trim();
  
  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={inputWrapperClasses}>
        {InputProps?.startAdornment && (
          <div className={startAdornmentClasses}>
            {InputProps.startAdornment}
          </div>
        )}
        
        <input
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          aria-invalid={error}
          {...props}
        />
        
        {InputProps?.endAdornment && (
          <div className={endAdornmentClasses}>
            {InputProps.endAdornment}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className={helperTextClasses}>{helperText}</p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField; 