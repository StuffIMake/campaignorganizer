import React from 'react';
import { Autocomplete, Chip, TextField } from './';
import type { AutocompleteRenderInputParams } from './Autocomplete';

export interface MultiAutocompleteProps<T> {
  options: T[];
  value: T[];
  onChange: (event: React.ChangeEvent<{}> | null, value: T[]) => void;
  getOptionLabel: (option: T) => string;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  renderTags?: (value: T[], getTagProps: any) => React.ReactNode;
  className?: string;
  multiple?: boolean;
}

function MultiAutocomplete<T>(props: MultiAutocompleteProps<T>) {
  // Forward all props to the regular Autocomplete component
  // but explicitly set multiple to true
  return (
    <Autocomplete
      {...props as any}
      multiple={true}
    />
  );
}

export default MultiAutocomplete; 