import React, { useState, useRef, useEffect, useCallback } from 'react';
import Box from './Box';
import { List, ListItem } from './List';
import Paper from './Paper';
import { TextFieldProps } from './TextField';

// Update params interface to include InputProps.inputProps for ARIA attrs
export interface AutocompleteRenderInputParams extends Omit<TextFieldProps, 'children'> {
  ref: React.Ref<HTMLInputElement>;
  InputProps?: {
    inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
      role?: string;
      'aria-autocomplete'?: 'list' | 'both' | 'none';
      'aria-expanded'?: boolean;
      'aria-controls'?: string;
      'aria-activedescendant'?: string;
    }
  }
}

interface AutocompleteProps<T> {
  options: T[];
  value: T | null;
  onChange: (event: React.ChangeEvent<{}> | null, value: T | null) => void;
  getOptionLabel: (option: T) => string;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  className?: string;
  sx?: Record<string, any>;
}

function Autocomplete<T>(
  props: AutocompleteProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  const {
    options,
    value,
    onChange,
    getOptionLabel,
    renderInput,
    isOptionEqualToValue,
    className = '',
    sx = {},
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value ? getOptionLabel(value) : '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Keep internal ref for input element
  const listboxRef = useRef<HTMLUListElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value ? getOptionLabel(value) : '');
  }, [value, getOptionLabel]);

  // Filter options based on input value
  const filteredOptions = options.filter(option => {
    const label = getOptionLabel(option);
    // Ensure label is a truthy string before calling toLowerCase
    // AND ensure inputValue is also a string
    return label && typeof label === 'string' &&
           typeof inputValue === 'string' &&
           label.toLowerCase().includes(inputValue.toLowerCase());
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update handleInputChange to accept value directly (from TextField's onChange)
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    // onChange(e, null); // Decide if typing should clear the selection externally
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionClick = (option: T) => {
    setInputValue(getOptionLabel(option));
    setIsOpen(false);
    onChange(null, option); // Pass null event, selected option
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      // Allow opening with arrow down if closed
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const itemElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (itemElement) {
        itemElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Prepare props for renderInput, including the ref and ARIA props via InputProps
  const renderInputParams: AutocompleteRenderInputParams = {
    value: inputValue,
    onChange: handleInputChange,
    onFocus: handleInputFocus,
    onKeyDown: handleKeyDown,
    ref: inputRef,
    InputProps: {
      inputProps: {
        role: 'combobox',
        'aria-autocomplete': 'list',
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? 'autocomplete-listbox' : undefined,
        'aria-activedescendant': isOpen && highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined,
      }
    }
  };

  // Merge containerRef and forwardedRef for the outer div if needed
  React.useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement);

  return (
    <Box 
      ref={containerRef} // Apply container ref here
      className={`autocomplete ${className}`}
      sx={{ position: 'relative', ...sx }}
    >
      {/* Call renderInput directly, passing params including the ref */}
      {renderInput(renderInputParams)}
      
      {isOpen && filteredOptions.length > 0 && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            zIndex: 1000, 
            width: '100%', 
            maxHeight: 300, 
            overflow: 'auto',
            mt: 1
          }}
        >
          <List 
            ref={listboxRef} 
            role="listbox" 
            id="autocomplete-listbox"
          >
            {filteredOptions.map((option, index) => (
                <ListItem 
                  key={index}
                  role="option"
                  id={`option-${index}`}
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleOptionClick(option)}
                  sx={{
                    cursor: 'pointer', 
                    bgcolor: highlightedIndex === index ? 'action.hover' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' } 
                  }}
                >
                  {getOptionLabel(option)}
                </ListItem>
              ))
            }
          </List>
        </Paper>
      )}
    </Box>
  );
}

// Adjust export type if needed
const ForwardedAutocomplete = React.forwardRef(Autocomplete);
export default ForwardedAutocomplete as <T>(
  props: AutocompleteProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => JSX.Element;

// StringAutocomplete helper
export const StringAutocomplete: React.FC<{
  options: string[];
  value: string | null;
  onChange: (event: React.ChangeEvent<{}> | null, value: string | null) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}> = (props) => {
  const autocompleteProps = {
    ...props,
    getOptionLabel: (option: string) => option,
    isOptionEqualToValue: (option: string, value: string) => option === value
  };
  // Use the forwarded ref component
  return <ForwardedAutocomplete {...autocompleteProps as any} />;
}; 