import React from 'react';
import { Item } from 'react-stately';

// Keep the props simple - just pass through to Item
interface MenuItemProps {
  children: React.ReactNode;
  value: string | number; // The selection value
  textValue?: string; // Optional text for typeahead/search
}

// React Stately's collection system identifies items by their key
// The conventional pattern is to use a data attribute to store the value
const MenuItem = ({ children, value, textValue, ...otherProps }: MenuItemProps) => {
  // Using data attributes to pass the value through to the rendered item
  return (
    <Item 
      {...otherProps}
      // Use stringified value as the item's data-value attribute
      // This will be used by the Select component to identify the selected item
      data-value={String(value)}
      // Key for React's virtual DOM reconciliation 
      key={String(value)}
      // Text value for typeahead/searching in the dropdown
      textValue={textValue ?? (typeof children === 'string' ? children : String(value))}
    >
      {children}
    </Item>
  );
};

MenuItem.displayName = 'MenuItem';

export default MenuItem; 