import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const AssetSearch: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <TextField 
      fullWidth
      placeholder="Search assets..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      aria-label="Search assets"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: searchText ? (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onPress={() => setSearchText('')}
              aria-label="Clear search"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
    />
  );
};

export default AssetSearch; 