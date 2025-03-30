import React, { forwardRef, useState } from 'react';
import Box from './Box';
import TextField from './TextField';
import Paper from './Paper';
import { List, ListItem } from './List';
import Chip from './Chip';
import IconButton from './IconButton';
import { CloseIcon } from '../../assets/icons';

interface AutocompleteProps<T> {
  options: T[];
  value: T | T[] | null;
  onChange: (event: React.ChangeEvent<{}>, value: T | T[] | null) => void;
  getOptionLabel: (option: T) => string;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  multiple?: boolean;
  freeSolo?: boolean;
  renderTags?: (value: T[], getTagProps: (props: any) => any) => React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}

export interface AutocompleteRenderInputParams {
  InputProps: {
    ref: React.Ref<any>;
    className: string;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  ref: React.Ref<any>;
}

function Autocomplete<T>(
  props: AutocompleteProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    options,
    value,
    onChange,
    getOptionLabel,
    renderInput,
    isOptionEqualToValue,
    multiple = false,
    freeSolo = false,
    renderTags,
    className = '',
    sx = {},
  } = props;

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Helper function to handle selection
  const handleOptionSelect = (option: T) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value, option] : [option];
      onChange({} as React.ChangeEvent<{}>, newValue);
    } else {
      onChange({} as React.ChangeEvent<{}>, option);
    }
    setOpen(false);
  };

  // Helper function to handle tag deletion in multiple mode
  const handleTagDelete = (tagToDelete: T) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter(item => 
        isOptionEqualToValue 
          ? !isOptionEqualToValue(item, tagToDelete)
          : item !== tagToDelete
      );
      onChange({} as React.ChangeEvent<{}>, newValue);
    }
  };

  // Generate tag props for renderTags function
  const getTagProps = ({ index }: { index: number }) => ({
    onDelete: () => Array.isArray(value) && handleTagDelete(value[index]),
  });

  // Render the input
  const params: AutocompleteRenderInputParams = {
    InputProps: {
      ref: null,
      className: 'autocomplete-input',
      startAdornment: multiple && Array.isArray(value) && value.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {renderTags 
            ? renderTags(value, getTagProps)
            : value.map((option, index) => (
              <Chip
                key={index}
                label={getOptionLabel(option)}
                onDelete={() => handleTagDelete(option)}
                size="small"
              />
            ))
          }
        </Box>
      ) : undefined,
      endAdornment: inputValue ? (
        <IconButton size="small" onClick={() => setInputValue('')}>
          <CloseIcon />
        </IconButton>
      ) : undefined,
    },
    inputProps: {
      value: inputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!open) setOpen(true);
      },
      onFocus: () => setOpen(true),
      onBlur: () => setTimeout(() => setOpen(false), 200),
    },
    ref,
  };

  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  if (sx.width) inlineStyle.width = sx.width;
  if (sx.minWidth) inlineStyle.minWidth = sx.minWidth;
  if (sx.maxWidth) inlineStyle.maxWidth = sx.maxWidth;

  return (
    <Box 
      ref={ref}
      className={`autocomplete ${className}`}
      sx={{ position: 'relative', ...sx }}
    >
      {renderInput(params)}
      
      {open && options.length > 0 && (
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
          <List>
            {options
              .filter(option => 
                inputValue === '' || 
                getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((option, index) => (
                <ListItem 
                  key={index} 
                  onClick={() => handleOptionSelect(option)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
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

export default forwardRef(Autocomplete) as <T>(
  props: AutocompleteProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => JSX.Element;

// Specialized string-only autocomplete that doesn't require getOptionLabel
export const StringAutocomplete: React.FC<{
  options: string[];
  value: string | null;
  onChange: (event: React.ChangeEvent<{}>, value: string | null) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}> = (props) => {
  // Provide a default getOptionLabel function for strings
  const autocompleteProps = {
    ...props,
    getOptionLabel: (option: string) => option,
    isOptionEqualToValue: (option: string, value: string) => option === value
  };
  
  return Autocomplete(autocompleteProps, null);
}; 