import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonGroupProps {
  children: ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'small' | 'medium';
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  orientation = 'horizontal',
  spacing = 'none',
  className,
}) => {
  const baseClasses = twMerge(
    'flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    spacing === 'small' ? 'gap-1' : spacing === 'medium' ? 'gap-2' : 'gap-0',
    className
  );

  // Generate the Button array with specific styles based on position
  return (
    <div className={baseClasses}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        // Base border radius classes that will be applied based on position
        let borderRadiusClasses = '';
        
        if (orientation === 'horizontal') {
          if (isFirst) borderRadiusClasses = 'rounded-r-none';
          else if (isLast) borderRadiusClasses = 'rounded-l-none';
          else borderRadiusClasses = 'rounded-none';
        } else {
          if (isFirst) borderRadiusClasses = 'rounded-b-none';
          else if (isLast) borderRadiusClasses = 'rounded-t-none';
          else borderRadiusClasses = 'rounded-none';
        }

        // Check if the child is a Button component
        const isButtonComponent = 
          typeof child.type === 'function' && 
          (child.type as any).displayName === 'Button';

        const existingClassName = child.props.className || '';
        const newProps: any = {
          className: twMerge(existingClassName, borderRadiusClasses),
        };

        // Only add these props if it's a Button component
        if (isButtonComponent) {
          newProps.variant = child.props.variant || variant;
          newProps.size = child.props.size || size;
          newProps.color = child.props.color || color;
        }

        return React.cloneElement(child, newProps);
      })}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup; 