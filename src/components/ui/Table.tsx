import React, { forwardRef } from 'react';

// Table component
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium';
  stickyHeader?: boolean;
  sx?: Record<string, any>;
}

const Table = forwardRef<HTMLTableElement, TableProps>(({
  children,
  className = '',
  size = 'medium',
  stickyHeader = false,
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.width) inlineStyle.width = sx.width;
  if (sx.minWidth) inlineStyle.minWidth = sx.minWidth;
  if (sx.maxWidth) inlineStyle.maxWidth = sx.maxWidth;
  if (sx.mt) inlineStyle.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.ml) inlineStyle.marginLeft = `${sx.ml * 0.25}rem`;
  if (sx.mr) inlineStyle.marginRight = `${sx.mr * 0.25}rem`;
  if (sx.mx) inlineStyle.marginLeft = inlineStyle.marginRight = `${sx.mx * 0.25}rem`;
  if (sx.my) inlineStyle.marginTop = inlineStyle.marginBottom = `${sx.my * 0.25}rem`;
  if (sx.m) inlineStyle.margin = `${sx.m * 0.25}rem`;
  
  // Size classes
  const sizeClass = size === 'small' ? 'text-sm' : 'text-base';
  
  return (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={`
          min-w-full divide-y divide-gray-200
          border-collapse border-spacing-0
          ${sizeClass}
          ${className}
        `}
        style={inlineStyle}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

Table.displayName = 'Table';

// TableHead component
interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}

const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(({
  children,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  return (
    <thead
      ref={ref}
      className={`bg-gray-50 ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </thead>
  );
});

TableHead.displayName = 'TableHead';

// TableBody component
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(({
  children,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  return (
    <tbody
      ref={ref}
      className={`bg-white divide-y divide-gray-200 ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </tbody>
  );
});

TableBody.displayName = 'TableBody';

// TableRow component
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  sx?: Record<string, any>;
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({
  children,
  className = '',
  hover = false,
  selected = false,
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  return (
    <tr
      ref={ref}
      className={`
        ${hover ? 'hover:bg-gray-50' : ''}
        ${selected ? 'bg-blue-50' : ''}
        transition-colors
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {children}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

// TableCell component
interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  padding?: 'normal' | 'checkbox' | 'none';
  size?: 'small' | 'medium';
  variant?: 'head' | 'body' | 'footer';
  sx?: Record<string, any>;
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({
  children,
  className = '',
  align = 'left',
  padding = 'normal',
  size = 'medium',
  variant = 'body',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Alignment classes
  const alignClasses = {
    inherit: '',
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }[align];
  
  // Padding classes
  const paddingClasses = {
    normal: 'px-4 py-3',
    checkbox: 'px-1 py-3',
    none: 'p-0'
  }[padding];
  
  // Size classes
  const sizeClasses = size === 'small' ? 'text-sm' : 'text-base';
  
  // Variant classes
  const variantClasses = variant === 'head' 
    ? 'font-medium text-gray-700'
    : (variant === 'footer' ? 'font-medium bg-gray-50' : 'font-normal text-gray-500');
  
  const Tag = variant === 'head' ? 'th' : 'td';
  
  return (
    <Tag
      ref={ref}
      className={`
        ${alignClasses}
        ${paddingClasses}
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    >
      {children}
    </Tag>
  );
});

TableCell.displayName = 'TableCell';

// TableFooter component
interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(({
  children,
  className = '',
  sx = {},
  ...props
}, ref) => {
  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  return (
    <tfoot
      ref={ref}
      className={`bg-gray-50 ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </tfoot>
  );
});

TableFooter.displayName = 'TableFooter';

export { 
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter
}; 