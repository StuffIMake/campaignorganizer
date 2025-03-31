import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';

interface OptionType {
  id: string;
  label: string;
}

type OptionValue = string | OptionType;

interface SearchableDropdownProps {
  options: OptionValue[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyOption?: string;
  className?: string;
  noOptionsMessage?: string;
}

/**
 * A reusable searchable dropdown component that uses Headless UI's Combobox.
 * Allows for searching through options and selecting a value.
 */
const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  emptyOption = 'None',
  className = '',
  noOptionsMessage = 'No options found'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search query when dropdown closes
  useEffect(() => {
    return () => setSearchQuery('');
  }, [value]);

  // Map options to a consistent format
  const normalizedOptions = options.map(option => 
    typeof option === 'string' 
      ? { id: option, label: option } 
      : option
  );

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter(option => {
    if (!searchQuery) return true;
    return option.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get the display value for the current selection
  const getDisplayValue = (val: string) => {
    if (!val) return emptyOption;
    const option = normalizedOptions.find(opt => opt.id === val);
    return option ? option.label : val;
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Combobox 
        value={value} 
        onChange={onChange}
      >
        <div className="relative w-full">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setSearchQuery(e.target.value)}
            displayValue={(val: string) => getDisplayValue(val)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="w-5 h-5 text-gray-400" aria-hidden="true">▼</span>
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          {emptyOption && (
            <Combobox.Option 
              value=""
              className={({ active }) =>
                `cursor-default select-none relative py-2 px-4 ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                }`
              }
            >
              {emptyOption}
            </Combobox.Option>
          )}
          {filteredOptions.map((option) => (
            <Combobox.Option
              key={option.id}
              value={option.id}
              className={({ active }) =>
                `cursor-default select-none relative py-2 px-4 ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                }`
              }
            >
              {option.label}
            </Combobox.Option>
          ))}
          {filteredOptions.length === 0 && (
            <div className="py-2 px-4 text-gray-500">{noOptionsMessage}</div>
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default SearchableDropdown; 