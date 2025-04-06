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
  const [inputText, setInputText] = useState<string>(value ? getOptionLabel(value) : '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  
  // Update input text when value prop changes from external source
  useEffect(() => {
    if (value !== null && getOptionLabel(value) !== inputText) {
      const newText = getOptionLabel(value);
      setInputText(newText);
      if (inputRef.current) {
        inputRef.current.value = newText;
      }
    }
  }, [value, getOptionLabel]); // Only react to explicit value changes

  // Filter options based on input text
  const filteredOptions = options.filter(option => {
    const label = getOptionLabel(option);
    return label && 
           typeof label === 'string' &&
           typeof inputText === 'string' &&
           label.toLowerCase().includes(inputText.toLowerCase());
  });

  // Handle outside clicks to close the dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      
      // Try to find an option matching current input
      if (inputText) {
        const matchingOption = options.find(opt => 
          getOptionLabel(opt).toLowerCase() === inputText.toLowerCase()
        );
        
        if (matchingOption) {
          onChange(null, matchingOption);
        } else if (value) {
          // Restore input text to match the current selection
          setInputText(getOptionLabel(value));
        }
      }
    }
  }, [value, inputText, options, getOptionLabel, onChange]);
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handle text input changes
  const handleInputChange = (newValue: string, event?: any) => {
    setInputText(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // Only clear selection if input is empty
    if (newValue === '' && value !== null) {
      onChange(null, null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle option selection
  const handleOptionClick = (option: T) => {
    const optionLabel = getOptionLabel(option);
    setInputText(optionLabel);
    setIsOpen(false);
    onChange(null, option);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
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

  // Handle mouse hover - only update highlighted index
  const handleMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  // Create input params for renderInput
  const getRenderInputParams = (): AutocompleteRenderInputParams => {
    return {
      value: inputText,
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
          value: inputText
        }
      }
    };
  };

  // Render option in dropdown
  const renderOption = (option: T, index: number) => {
    const isHighlighted = highlightedIndex === index;
    const optionLabel = getOptionLabel(option);
    
    return (
      <ListItem 
        key={index}
        role="option"
        id={`option-${index}`}
        aria-selected={isHighlighted}
        onClick={() => handleOptionClick(option)}
        onMouseEnter={() => handleMouseEnter(index)}
        sx={{
          cursor: 'pointer', 
          bgcolor: isHighlighted ? 'action.hover' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' } 
        }}
      >
        {optionLabel}
      </ListItem>
    );
  };

  React.useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement);

  // Ensure input value is preserved
  React.useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = inputText;
    }
  }, [inputText, isOpen, highlightedIndex]);
  
  return (
    <Box 
      ref={containerRef}
      className={`autocomplete ${className}`}
      sx={{ position: 'relative', ...sx }}
    >
      {/* Render the input component */}
      {renderInput(getRenderInputParams())}
      
      {/* Render dropdown if open and options exist */}
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
            {filteredOptions.map((option, index) => renderOption(option, index))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

// Export with forwardRef
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
  return <ForwardedAutocomplete {...autocompleteProps as any} />;
}; 