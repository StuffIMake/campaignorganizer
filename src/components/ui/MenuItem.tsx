import React, { forwardRef } from 'react';

interface MenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  value?: string | number | readonly string[];
}

const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(({
  children,
  className = '',
  disabled = false,
  selected = false,
  value,
  ...props
}, ref) => {
  return (
    <li
      ref={ref}
      className={`
        px-4 py-2
        cursor-pointer
        text-sm
        ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
        ${selected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' : 'text-slate-900 dark:text-white'}
        ${className}
      `}
      data-value={value}
      role="option"
      aria-disabled={disabled}
      aria-selected={selected}
      {...props}
    >
      {children}
    </li>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem; 