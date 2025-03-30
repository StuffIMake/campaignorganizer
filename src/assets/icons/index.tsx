import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | string;
  sx?: Record<string, any>;
}

// Common icon component that applies consistent styling
const Icon: React.FC<React.PropsWithChildren<IconProps>> = ({ 
  children, 
  className = '',
  size = 24,
  color,
  sx = {}
}) => {
  // Convert Material UI style sx object to inline style object
  const inlineStyle: React.CSSProperties = {};
  
  // Handle commonly used sx properties
  if (sx.fontSize) inlineStyle.fontSize = sx.fontSize;
  if (sx.filter) inlineStyle.filter = sx.filter;
  if (sx.transform) inlineStyle.transform = sx.transform;
  
  // Handle color prop
  let colorClass = '';
  if (color === 'primary') colorClass = 'text-blue-500';
  else if (color === 'secondary') colorClass = 'text-purple-500';
  else if (color === 'error') colorClass = 'text-red-500';
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`inline-block ${colorClass} ${className}`}
      style={inlineStyle}
    >
      {children}
    </svg>
  );
};

// Dashboard
export const DashboardIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Icon>
);

// Maps and Locations
export const MapIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </Icon>
);

export const PlaceIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

// People
export const PersonIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

// Combat
export const SportsKabaddiIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="5" cy="6" r="3" />
    <path d="M9 6h5l3 5.063V16h-2" />
    <path d="M8 16l-2-6.063L12 7" />
    <path d="M18 19c0 1.105-3.134 2-7 2s-7-.895-7-2" />
    <path d="M10 12l2 7" />
  </Icon>
);

// Actions
export const AddIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export const RemoveIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Icon>
);

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Icon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Icon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

export const UploadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

export const ClearIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);

export const HelpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

// Audio
export const MusicNoteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Icon>
);

export const PlayArrowIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </Icon>
);

export const VolumeUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Icon>
);

export const VolumeOffIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </Icon>
);

export const MinimizeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="8" y1="12" x2="16" y2="12" />
  </Icon>
);

export const LoopIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Icon>
);

export const DoNotDisturbIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </Icon>
);

// Navigation and Controls
export const MenuIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

export const ExpandMoreIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const ExpandLessIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="18 15 12 9 6 15" />
  </Icon>
);

export const CloudUploadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </Icon>
);

export const NorthIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </Icon>
);

export const RestartAltIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M3 2v6h6" />
    <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
    <path d="M21 22v-6h-6" />
    <path d="M3 12A9 9 0 0 1 18 18.7l3-2.7" />
  </Icon>
);

export const ArrowBackIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Icon>
);

export const ImageIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </Icon>
);

export const ImageNotSupportedIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </Icon>
);

export const CancelIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </Icon>
);

export const CodeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Icon>
);

export const MerchantIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="16" cy="12" r="1" />
    <circle cx="8" cy="12" r="1" />
  </Icon>
);

export const Star: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);

// Allow for direct import of all icons
export const Icons = {
  Add: AddIcon,
  Remove: RemoveIcon,
  Edit: EditIcon,
  Delete: DeleteIcon,
  Close: CloseIcon,
  Save: SaveIcon,
  Download: DownloadIcon,
  Upload: UploadIcon,
  Search: SearchIcon,
  Clear: ClearIcon,
  Help: HelpIcon,
  MusicNote: MusicNoteIcon,
  PlayArrow: PlayArrowIcon,
  VolumeUp: VolumeUpIcon,
  VolumeOff: VolumeOffIcon,
  Minimize: MinimizeIcon,
  Loop: LoopIcon,
  DoNotDisturb: DoNotDisturbIcon,
  Menu: MenuIcon,
  ExpandMore: ExpandMoreIcon,
  ExpandLess: ExpandLessIcon,
  CloudUpload: CloudUploadIcon,
  North: NorthIcon,
  RestartAlt: RestartAltIcon,
  Image: ImageIcon,
  ImageNotSupported: ImageNotSupportedIcon,
  Dashboard: DashboardIcon,
  Map: MapIcon,
  Place: PlaceIcon,
  Person: PersonIcon,
  SportsKabaddi: SportsKabaddiIcon,
  Cancel: CancelIcon,
  ArrowBack: ArrowBackIcon,
  Code: CodeIcon,
  Merchant: MerchantIcon,
  Star: Star,
}; 