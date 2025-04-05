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

interface CharacterSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const CharacterSearch: React.FC<CharacterSearchProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="w-full">
      <div className="bg-background-surface/60 backdrop-blur-sm rounded-xl shadow-md p-1">
        <TextField
          fullWidth
          placeholder="Search characters by name, type, location, or items..."
          value={searchQuery}
          onChange={(value) => onSearchChange(value)}
          aria-label="Search characters"
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
                  aria-label="Clear search"
                  className="text-text-secondary hover:text-primary-light"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
    </div>
  );
}; 