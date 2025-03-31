import React from 'react';
import { Box, TextField, InputAdornment, IconButton, Typography } from '../../../components/ui';
import { SearchIcon, ClearIcon } from '../../../assets/icons';

interface CombatSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultsCount: number;
  totalCount: number;
}

export const CombatSearch: React.FC<CombatSearchProps> = ({
  searchQuery,
  setSearchQuery,
  resultsCount,
  totalCount
}) => {
  // Clear the search query
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Box className="mb-4">
      <TextField
        fullWidth
        placeholder="Search combats by name, description, characters, and more..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClearSearch}
                size="small"
                aria-label="clear search"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      {searchQuery && (
        <Typography variant="caption" className="mt-1 block text-gray-500">
          Showing {resultsCount} of {totalCount} combats
        </Typography>
      )}
    </Box>
  );
}; 