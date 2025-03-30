import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  fontSize?: 'small' | 'medium' | 'large';
  sx?: Record<string, any>;
}

// Helper to handle fontSize and sx props
const withIconProps = (IconComponent: React.FC<React.SVGProps<SVGSVGElement>>) => {
  return ({ fontSize, sx, ...props }: IconProps) => {
    // Convert fontSize to size
    let size = '1.5em'; // medium default
    if (fontSize === 'small') size = '1.25em';
    if (fontSize === 'large') size = '2em';
    
    // Apply sx styles directly as style props
    const style = sx ? {
      ...(sx.verticalAlign ? { verticalAlign: sx.verticalAlign } : {}),
      ...(sx.mr ? { marginRight: `${sx.mr * 0.25}rem` } : {}),
      ...(sx.ml ? { marginLeft: `${sx.ml * 0.25}rem` } : {}),
      // Add any other sx properties as needed
      ...props.style,
    } : props.style;
    
    return <IconComponent width={size} height={size} style={style} {...props} />;
  };
};

// Person icon (for NPCs)
const BasePersonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

// Store icon (for Merchants)
const BaseStoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
  </svg>
);

// Sports Kabaddi icon (for Enemies)
const BaseSportsKabaddiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M16.5 2.25c1.5 0 2.5 1.12 2.5 2.5 0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5c0-1.38 1-2.5 2.5-2.5zM9 2.25c1.5 0 2.5 1.12 2.5 2.5 0 1.5-1 2.5-2.5 2.5S6.5 6.25 6.5 4.75c0-1.38 1-2.5 2.5-2.5zm10.23 9.14l-1.41-3.98-3.86 1.34c-.38.14-.65.46-.74.85l-.19 1.05 2.24 5.04 2.9 1.41v5c0 .33.16.65.45.82.27.15.61.15.89-.01.54-.31.77-1.05.43-1.65v-4.62l-2.05-1.02-.34-.97 1.14-.4.52 1.49 3.19 1.58c.53.27 1.17.03 1.43-.5.26-.52.02-1.16-.5-1.43l-3.7-1.8zm-13.21-3.9l-3.01-1.75c-.53-.3-1.21-.12-1.53.4a.984.984 0 0 0 .37 1.37l2.09 1.21-3.98 6.08L2 20.75c.37.62 1.19.81 1.82.44.63-.38.83-1.17.44-1.81l-.28-.47 2.44-.49 2.14-3.23.2 4.65a.998.998 0 0 0 1.44.87c.6-.31.79-1.09.48-1.69l-1.27-2.42 2.31-3.51 3.54.35c.15.01.3-.01.44-.1l1.03-.56-3.71-8.35-3.78 1.31c-.39.14-.67.46-.75.86l-.2 1.05 2.5 5.52-1.23 1.85-1.04-5.09z" />
  </svg>
);

// Videogame Asset icon (for Players)
const BaseVideogameAssetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

// Place icon (for Locations)
const BasePlaceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// Inventory icon
const BaseInventoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M20 2H4c-1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 2v3H4V4h16zM4 20V9h16v11H4zm7-9h6v2h-6v-2zm0 4h6v2h-6v-2z" />
  </svg>
);

// Edit icon
const BaseEditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

// Delete icon
const BaseDeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

// Save icon
const BaseSaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

// Search icon
const BaseSearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

// Add icon
const BaseAddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

// Help icon
const BaseHelpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

// Clear/Close icon
const BaseClearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

// Apply the HOC to all icon components
export const PersonIcon = withIconProps(BasePersonIcon);
export const StoreIcon = withIconProps(BaseStoreIcon);
export const SportsKabaddiIcon = withIconProps(BaseSportsKabaddiIcon);
export const VideogameAssetIcon = withIconProps(BaseVideogameAssetIcon);
export const PlaceIcon = withIconProps(BasePlaceIcon);
export const InventoryIcon = withIconProps(BaseInventoryIcon);
export const EditIcon = withIconProps(BaseEditIcon);
export const DeleteIcon = withIconProps(BaseDeleteIcon);
export const SaveIcon = withIconProps(BaseSaveIcon);
export const SearchIcon = withIconProps(BaseSearchIcon);
export const AddIcon = withIconProps(BaseAddIcon);
export const HelpIcon = withIconProps(BaseHelpIcon);
export const ClearIcon = withIconProps(BaseClearIcon); 