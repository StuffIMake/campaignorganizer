import React, { useState } from 'react';
import { TextField, IconButton } from '../../../components/ui';
import { SearchIcon, ClearIcon } from '../../../assets/icons';

const AssetSearch: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const handleChange = (value: string) => {
    setSearchText(value);
  };

  return (
    <div className="relative w-full">
      <TextField 
        fullWidth
        placeholder="Search assets..."
        value={searchText}
        onChange={handleChange}
        aria-label="Search assets"
        className="w-full"
        InputProps={{
          startAdornment: <SearchIcon className="text-gray-400" />,
          endAdornment: searchText ? (
            <IconButton 
              size="small" 
              onClick={() => setSearchText('')}
              aria-label="Clear search"
              className="text-gray-400 hover:text-gray-300"
            >
              <ClearIcon />
            </IconButton>
          ) : null
        }}
      />
    </div>
  );
};

export default AssetSearch; 