import React, { forwardRef } from 'react';

interface InputAdornmentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  position: 'start' | 'end';
}

const InputAdornment = forwardRef<HTMLDivElement, InputAdornmentProps>(({
  children,
  className = '',
  position,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        flex items-center justify-center
        text-slate-500 dark:text-slate-400
        ${position === 'start' ? 'mr-2' : 'ml-2'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

InputAdornment.displayName = 'InputAdornment';

export default InputAdornment; 