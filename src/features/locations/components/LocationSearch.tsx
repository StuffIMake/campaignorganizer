/**
 * @file LocationSearch.tsx
 * @description Search component for locations with real-time filtering
 */

import React from 'react';
import { 
  Paper, 
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
  resultsCount: number;
  
  /** Total number of locations (used for displaying counts) */
  totalCount: number;
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
  onSearchChange
}) => {
  return (
    <Paper className="p-4 mb-4">
      <TextField
        fullWidth
        placeholder="Search locations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton onClick={() => onSearchChange('')} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Paper>
  );
}; 