import React from 'react';
import { TextField, InputAdornment, IconButton, Typography } from '../../../components/ui';
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
    <div className="relative w-full">
      <div className="w-full rounded-xl overflow-hidden backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all">
        <TextField
          fullWidth
          placeholder="Search combats by name, description, characters, and more..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          aria-label="Search combats"
          className="bg-transparent"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-primary-DEFAULT" />
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
      </div>
      {searchQuery && (
        <Typography variant="caption" className="mt-1 ml-3 block text-text-secondary">
          Showing {resultsCount} of {totalCount} combats
        </Typography>
      )}
    </div>
  );
}; 