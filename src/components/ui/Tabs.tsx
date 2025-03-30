import React, { useState, ReactElement } from 'react';

interface TabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  children: React.ReactNode;
  variant?: 'standard' | 'fullWidth' | 'scrollable';
  className?: string;
}

interface TabProps {
  label: string;
  value?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onChange,
  children,
  variant = 'standard',
  className = '',
}) => {
  const variantClasses = {
    standard: '',
    fullWidth: 'grid',
    scrollable: 'overflow-x-auto flex scrollbar-thin'
  };
  
  // Calculate grid-template-columns for fullWidth
  const childrenCount = React.Children.count(children);
  const gridTemplateColumns = variant === 'fullWidth' ? `grid-cols-${childrenCount}` : '';
  
  return (
    <div 
      className={`
        border-b border-slate-700/50
        ${variantClasses[variant]}
        ${variant === 'fullWidth' ? gridTemplateColumns : ''}
        ${className}
      `}
      role="tablist"
    >
      {children}
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({
  label,
  value = 0,
  disabled = false,
  icon,
  className = '',
}) => {
  // useContext would be better here but for simplicity we'll use props
  const isSelected = value === (value ?? 0);
  
  return (
    <button
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-4 py-2.5 text-sm font-medium
        border-b-2 -mb-px
        focus-visible:outline-none
        transition-all duration-200
        ${isSelected 
          ? 'text-primary-400 border-primary-400' 
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  className = '',
}) => {
  const hidden = value !== index;
  
  return (
    <div
      role="tabpanel"
      hidden={hidden}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={`py-4 ${className}`}
    >
      {!hidden && children}
    </div>
  );
};

// Composite component for managing tabs state
interface TabsManagerProps {
  children: React.ReactNode;
  defaultTab?: number;
  className?: string;
}

export const TabsManager: React.FC<TabsManagerProps> = ({
  children,
  defaultTab = 0,
  className = '',
}) => {
  const [value, setValue] = useState(defaultTab);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Use type assertions to safely clone elements with proper props
  const childrenWithProps = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    
    // For Tabs component
    if (child.type === Tabs) {
      return React.cloneElement(child as ReactElement<TabsProps>, {
        value,
        onChange: handleChange
      } as Partial<TabsProps>);
    }
    
    // For TabPanel components
    else if (child.type === TabPanel) {
      return React.cloneElement(child as ReactElement<TabPanelProps>, {
        value
      } as Partial<TabPanelProps>);
    }
    
    return child;
  });

  return (
    <div className={className}>
      {childrenWithProps}
    </div>
  );
};

export default { Tabs, Tab, TabPanel, TabsManager }; 