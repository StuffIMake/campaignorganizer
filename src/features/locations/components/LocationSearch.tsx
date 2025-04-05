/**
 * @file LocationSearch.tsx
 * @description Search component for locations with real-time filtering
 */

import React from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton 
} from '../../../components/ui';
import { 
  SearchIcon, 
  ClearIcon 
} from '../../../assets/icons';

/**
 * Props for the LocationSearch component
 */
interface LocationSearchProps {
  /** Current search query string */
  searchQuery: string;
  
  /** Callback function to update search query */
  onSearchChange: (value: string) => void;
  
  /** Number of locations matching the current search */
  resultsCount?: number;
  
  /** Total number of locations (used for displaying counts) */
  totalCount?: number;
}

/**
 * LocationSearch component
 * 
 * Provides a search input field with search and clear icons for filtering locations.
 * Shows the count of matching results.
 * 
 * @param {LocationSearchProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const LocationSearch: React.FC<LocationSearchProps> = ({
  searchQuery,
  onSearchChange,
  resultsCount,
  totalCount
}) => {
  return (
    <div className="w-full">
      <div className="bg-background-surface/60 backdrop-blur-sm rounded-xl shadow-md p-1">
        <TextField
          fullWidth
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(value) => onSearchChange(value)}
          aria-label="Search locations"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-text-secondary" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => onSearchChange('')} 
                  size="small"
                  aria-label="Clear location search"
                  className="text-text-secondary hover:text-primary-light"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
      {(resultsCount !== undefined && totalCount !== undefined) && (
        <div className="text-xs text-text-secondary mt-1 ml-3">
          {searchQuery ? `${resultsCount} matches found` : `${totalCount} locations total`}
        </div>
      )}
    </div>
  );
}; 