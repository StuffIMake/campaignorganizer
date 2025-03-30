import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { ExpandMoreIcon } from '../../assets/icons';

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  value: string | string[] | number;
  onChange?: (event: React.ChangeEvent<{ value: unknown }>) => void;
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  sx?: Record<string, any>;
  MenuProps?: {
    PaperProps?: {
      style?: React.CSSProperties;
    };
  };
  renderValue?: (value: any) => React.ReactNode;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(({
  children,
  className = '',
  value,
  onChange,
  multiple = false,
  label,
  disabled = false,
  error = false,
  fullWidth = false,
  sx = {},
  MenuProps,
  renderValue,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  
  // Handle sx props
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.width) inlineStyle.width = sx.width;
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle option click
  const handleOptionClick = (optionValue: string | number) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: multiple 
            ? Array.isArray(value) 
              ? value.includes(optionValue) 
                ? value.filter(v => v !== optionValue) 
                : [...value, optionValue]
              : [optionValue]
            : optionValue
        },
      } as React.ChangeEvent<{ value: unknown }>;
      
      onChange(syntheticEvent);
    }
    
    if (!multiple) {
      setIsOpen(false);
    }
  };
  
  // Find selected option label
  const getSelectedLabel = () => {
    if (renderValue) {
      return renderValue(value);
    }
    
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return '';
      
      // Find all selected options
      const selectedLabels: React.ReactNode[] = [];
      React.Children.forEach(children, child => {
        if (React.isValidElement(child) && child.props.value !== undefined) {
          if (value.includes(child.props.value)) {
            selectedLabels.push(child.props.children);
          }
        }
      });
      
      return selectedLabels.join(', ');
    } else {
      // Find the option with matching value
      let selectedLabel = '';
      React.Children.forEach(children, child => {
        if (React.isValidElement(child) && child.props.value === value) {
          selectedLabel = child.props.children;
        }
      });
      
      return selectedLabel;
    }
  };
  
  const hasFloatingLabel = label && label.length > 0;
  
  return (
    <div
      ref={ref}
      className={`
        relative
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {hasFloatingLabel && (
        <label 
          className={`
            absolute 
            left-2 
            ${isOpen || value ? '-top-2 text-xs bg-white dark:bg-slate-900 px-1' : 'top-1/2 -translate-y-1/2 text-sm'}
            z-10 
            transition-all
            ${error ? 'text-red-500' : 'text-slate-500'}
          `}
        >
          {label}
        </label>
      )}
      
      <div
        ref={selectRef}
        className={`
          relative
          flex items-center justify-between
          w-full
          px-3 py-2
          bg-white dark:bg-slate-800
          border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
          rounded-md
          cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={`flex-grow truncate ${hasFloatingLabel && !isOpen && !value ? 'invisible' : ''}`}>
          {getSelectedLabel()}
        </div>
        <div className="flex-shrink-0 ml-2">
          <ExpandMoreIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <ul
          ref={menuRef}
          className={`
            absolute z-20
            w-full
            mt-1
            py-1
            bg-white dark:bg-slate-800
            border border-slate-300 dark:border-slate-600
            rounded-md
            shadow-lg
            max-h-60 overflow-auto
          `}
          style={MenuProps?.PaperProps?.style}
          role="listbox"
          aria-multiselectable={multiple}
        >
          {React.Children.map(children, child => {
            if (!React.isValidElement(child)) return null;
            
            const selected = multiple && Array.isArray(value) 
              ? value.includes(child.props.value)
              : child.props.value === value;
            
            return React.cloneElement(child, {
              onClick: () => handleOptionClick(child.props.value),
              selected
            });
          })}
        </ul>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 