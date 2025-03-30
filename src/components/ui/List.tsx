import React, { forwardRef } from 'react';

interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
  className?: string;
  disablePadding?: boolean;
  dense?: boolean;
  sx?: Record<string, any>;
}

const List = forwardRef<HTMLUListElement, ListProps>(({
  children,
  className = '',
  disablePadding = false,
  dense = false,
  sx = {},
  ...props
}, ref) => {
  // Convert Material UI style sx object to inline style object
  const inlineStyle: React.CSSProperties = {};

  // Handle commonly used sx properties
  if (sx.width) inlineStyle.width = sx.width;
  if (sx.maxWidth) inlineStyle.maxWidth = sx.maxWidth;
  if (sx.maxHeight) inlineStyle.maxHeight = sx.maxHeight;
  if (sx.overflowY) inlineStyle.overflowY = sx.overflowY;
  if (sx.overflowX) inlineStyle.overflowX = sx.overflowX;
  if (sx.flexGrow !== undefined) inlineStyle.flexGrow = sx.flexGrow;

  return (
    <ul
      ref={ref}
      className={`
        ${!disablePadding ? 'py-2' : ''}
        ${dense ? 'space-y-0.5' : 'space-y-1'}
        ${className}
      `}
      style={{
        ...props.style,
        ...inlineStyle
      }}
      {...props}
    >
      {children}
    </ul>
  );
});

List.displayName = 'List';

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
  divider?: boolean;
  disablePadding?: boolean;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  sx?: Record<string, any>;
  secondaryAction?: React.ReactNode;
}

const ListItem = forwardRef<HTMLLIElement, ListItemProps>(({
  children,
  className = '',
  selected = false,
  disabled = false,
  divider = false,
  disablePadding = false,
  onClick,
  sx = {},
  secondaryAction,
  ...props
}, ref) => {
  // Convert Material UI style sx object to inline style object
  const inlineStyle: React.CSSProperties = {};

  // Build class names
  const selectedClass = selected ? 'bg-primary-600/20' : '';
  const disabledClass = disabled ? 'opacity-50 pointer-events-none' : '';
  const clickableClass = onClick ? 'cursor-pointer hover:bg-slate-800/80' : '';
  const dividerClass = divider ? 'border-b border-slate-700/50' : '';
  const paddingClass = disablePadding ? '' : 'px-4 py-2';

  // Process children to avoid nested <li> elements
  const processedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
    // Check if the child is a ListItem or has a displayName of ListItem
    const isListItemComponent = 
      child.type === ListItem || 
      (typeof child.type === 'function' && 
       ((child.type as any).displayName === 'ListItem' || 
        (child.type as any).name === 'ListItem'));
    
    if (isListItemComponent) {
      return child.props.children;
    }
    
    return child;
  });

  // If there's a secondaryAction, render a flex container
  if (secondaryAction) {
    return (
      <li
        ref={ref}
        className={`
          ${paddingClass} transition-colors
          ${selectedClass}
          ${disabledClass}
          ${clickableClass}
          ${dividerClass}
          ${className}
          flex justify-between items-center
        `}
        onClick={disabled ? undefined : onClick}
        style={{
          ...props.style,
          ...inlineStyle
        }}
        {...props}
      >
        <div className="flex-grow">
          {processedChildren}
        </div>
        <div className="ml-2">{secondaryAction}</div>
      </li>
    );
  }

  // Regular list item without secondaryAction
  return (
    <li
      ref={ref}
      className={`
        ${paddingClass} transition-colors
        ${selectedClass}
        ${disabledClass}
        ${clickableClass}
        ${dividerClass}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      style={{
        ...props.style,
        ...inlineStyle
      }}
      {...props}
    >
      {processedChildren}
    </li>
  );
});

ListItem.displayName = 'ListItem';

// ListItemButton is a clickable ListItem
interface ListItemButtonProps extends Omit<ListItemProps, 'divider'> {
  component?: React.ElementType;
}

const ListItemButton = forwardRef<HTMLLIElement, ListItemButtonProps>(({
  children,
  component: Component = 'div',
  className = '',
  selected = false,
  disabled = false,
  onClick,
  sx = {},
  ...props
}, ref) => {
  return (
    <ListItem
      ref={ref}
      className={`
        cursor-pointer
        hover:bg-slate-800/80
        active:bg-slate-700/50
        ${className}
      `}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <Component className="flex items-center w-full">
        {children}
      </Component>
    </ListItem>
  );
});

ListItemButton.displayName = 'ListItemButton';

// ListItemIcon adds proper spacing for icons
interface ListItemIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}

const ListItemIcon: React.FC<ListItemIconProps> = ({
  children,
  className = '',
  sx = {},
  ...props
}) => {
  // Convert Material UI style sx object to inline style object
  const inlineStyle: React.CSSProperties = {};
  
  // Handle commonly used sx properties
  if (sx.minWidth) inlineStyle.minWidth = `${sx.minWidth}px`;
  
  return (
    <div
      className={`mr-3 min-w-[24px] ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
};

// ListItemText adds proper spacing for text content
interface ListItemTextProps extends React.HTMLAttributes<HTMLDivElement> {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  primaryTypographyProps?: Record<string, any>;
  secondaryTypographyProps?: Record<string, any>;
}

const ListItemText: React.FC<ListItemTextProps> = ({
  primary,
  secondary,
  className = '',
  sx = {},
  primaryTypographyProps = {},
  secondaryTypographyProps = {},
  ...props
}) => {
  // Convert typography props to class strings
  const primaryClasses = `text-sm font-medium text-white 
    ${primaryTypographyProps.variant === 'body2' ? 'text-xs' : ''}
    ${primaryTypographyProps.variant === 'subtitle1' ? 'text-base font-semibold' : ''}
    ${primaryTypographyProps.variant === 'subtitle2' ? 'text-sm font-semibold' : ''}
    ${primaryTypographyProps.className || ''}
  `;
  
  const secondaryClasses = `text-xs text-slate-400
    ${secondaryTypographyProps.className || ''}
  `;
  
  return (
    <div
      className={`flex flex-col ${className}`}
      {...props}
    >
      {primary && (
        <div className={primaryClasses}>{primary}</div>
      )}
      {secondary && (
        <div className={secondaryClasses}>{secondary}</div>
      )}
    </div>
  );
};

export { List, ListItem, ListItemButton, ListItemIcon, ListItemText }; 