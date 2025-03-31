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
} from '../../../components/ui';

interface CharacterSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const CharacterSearch: React.FC<CharacterSearchProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <Paper className="p-4 mb-4">
      <TextField
        fullWidth
        placeholder="Search characters by name, type, location, or items..."
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