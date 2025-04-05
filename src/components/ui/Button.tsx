import React, { forwardRef, useRef, ElementType } from 'react';
import { useButton } from 'react-aria';
import type { AriaButtonProps } from 'react-aria';

// Button variants
export type ButtonVariant = 
  | 'contained' 
  | 'outlined' 
  | 'text' 
  | 'glass'
  | 'gradient';

// Button colors
export type ButtonColor = 
  | 'primary' 
  | 'secondary' 
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

// Button sizes
export type ButtonSize = 
  | 'small' 
  | 'medium' 
  | 'large';

// Props combining AriaButtonProps with custom and standard HTML attributes
export interface ButtonProps extends AriaButtonProps { // Inherit directly from AriaButtonProps
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  disableElevation?: boolean;
  disableRipple?: boolean;
  href?: string;
  rounded?: boolean;
  className?: string;
  children?: React.ReactNode;
  // Standard HTML attributes we want to support
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  name?: string;
  value?: string | number;
  // Anchor specific props
  target?: string;
  rel?: string;
}

// Define a type for the underlying element based on href presence
type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

export const Button = forwardRef<ButtonElement, ButtonProps>(({
  // Extract AriaButtonProps recognized by useButton
  onPress,
  onPressChange,
  onPressStart,
  onPressEnd,
  onPressUp,
  // isDisabled from AriaButtonProps is used for the hook
  isDisabled: ariaIsDisabled = false, 
  // Extract custom/styling props
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  className = '',
  startIcon,
  endIcon,
  fullWidth = false,
  loading = false,
  loadingText,
  disableElevation = false,
  disableRipple = false,
  rounded = false,
  // Extract standard HTML attributes
  type = 'button',
  form,
  name,
  value,
  href,
  target,
  rel,
  // Collect any other AriaButtonProps passed in
  ...otherAriaProps
}, forwardedRef) => {
  const ref = useRef<ButtonElement>(null);
  const elementType: ElementType = href ? 'a' : 'button';

  // Combine aria isDisabled with loading state
  const finalIsDisabled = ariaIsDisabled || loading;

  // Prepare props for useButton hook
  const buttonHookProps: AriaButtonProps<ElementType> = {
    ...otherAriaProps,
    elementType,
    isDisabled: finalIsDisabled,
    onPress,
    onPressChange,
    onPressStart,
    onPressEnd,
    onPressUp,
    href,
    target,
    rel,
  };

  const { buttonProps, isPressed } = useButton(buttonHookProps, ref);

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-900';
  
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-2.5 text-base'
  }[size];
  
  // Color and variant classes
  let colorAndVariantClasses = '';
  
  // Contained button styling
  if (variant === 'contained') {
    if (color === 'primary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-indigo-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md hover:shadow-lg';
    } else if (color === 'secondary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-amber-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-md hover:shadow-lg';
    } else if (color === 'success') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-emerald-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md hover:shadow-lg';
    } else if (color === 'warning') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-amber-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-md hover:shadow-lg';
    } else if (color === 'error') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-red-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md hover:shadow-lg';
    } else if (color === 'info') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-sky-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-md hover:shadow-lg';
    } else {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-slate-600/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-slate-700 hover:bg-slate-800 text-white shadow-md hover:shadow-lg';
    }
    // Add pressed state style for contained buttons
    if (isPressed && !finalIsDisabled) {
      colorAndVariantClasses = colorAndVariantClasses.replace(/active:bg-[^\\s]+/, ''); // Remove active state if pressed is handled
      if (color === 'primary') colorAndVariantClasses += ' bg-indigo-800';
      else if (color === 'secondary') colorAndVariantClasses += ' bg-amber-700';
      else if (color === 'success') colorAndVariantClasses += ' bg-emerald-800';
      else if (color === 'warning') colorAndVariantClasses += ' bg-amber-700';
      else if (color === 'error') colorAndVariantClasses += ' bg-red-800';
      else if (color === 'info') colorAndVariantClasses += ' bg-sky-800';
      else colorAndVariantClasses += ' bg-slate-900';
    }
  }
  
  // Outlined button styling
  else if (variant === 'outlined') {
    if (color === 'primary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-indigo-500/30 text-indigo-500/40 cursor-not-allowed'
        : 'border border-indigo-500/70 hover:border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 active:bg-indigo-500/20';
    } else if (color === 'secondary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-amber-500/30 text-amber-500/40 cursor-not-allowed'
        : 'border border-amber-500/70 hover:border-amber-500 text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/20';
    } else if (color === 'success') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-emerald-500/30 text-emerald-500/40 cursor-not-allowed'
        : 'border border-emerald-500/70 hover:border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 active:bg-emerald-500/20';
    } else if (color === 'warning') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-amber-500/30 text-amber-500/40 cursor-not-allowed'
        : 'border border-amber-500/70 hover:border-amber-500 text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/20';
    } else if (color === 'error') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-red-500/30 text-red-500/40 cursor-not-allowed'
        : 'border border-red-500/70 hover:border-red-500 text-red-500 hover:bg-red-500/10 active:bg-red-500/20';
    } else if (color === 'info') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-sky-500/30 text-sky-500/40 cursor-not-allowed'
        : 'border border-sky-500/70 hover:border-sky-500 text-sky-500 hover:bg-sky-500/10 active:bg-sky-500/20';
    } else {
      colorAndVariantClasses = finalIsDisabled 
        ? 'border border-slate-400/30 text-slate-400/50 cursor-not-allowed'
        : 'border border-slate-400/70 hover:border-slate-300 text-slate-300 hover:bg-slate-300/10';
    }
    // Add pressed state style for outlined buttons
    if (isPressed && !finalIsDisabled) {
      colorAndVariantClasses = colorAndVariantClasses.replace(/active:bg-[^\\s]+/, ''); // Remove active state if pressed is handled
      if (color === 'primary') colorAndVariantClasses += ' bg-indigo-500/20';
      else if (color === 'secondary') colorAndVariantClasses += ' bg-amber-500/20';
      else if (color === 'success') colorAndVariantClasses += ' bg-emerald-500/20';
      else if (color === 'warning') colorAndVariantClasses += ' bg-amber-500/20';
      else if (color === 'error') colorAndVariantClasses += ' bg-red-500/20';
      else if (color === 'info') colorAndVariantClasses += ' bg-sky-500/20';
      else colorAndVariantClasses += ' bg-slate-300/20';
    }
  }
  
  // Text button styling
  else if (variant === 'text') {
    if (color === 'primary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-indigo-500/40 cursor-not-allowed'
        : 'text-indigo-500 hover:bg-indigo-500/10 active:bg-indigo-500/20';
    } else if (color === 'secondary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-amber-500/40 cursor-not-allowed'
        : 'text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/20';
    } else if (color === 'success') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-emerald-500/40 cursor-not-allowed'
        : 'text-emerald-500 hover:bg-emerald-500/10 active:bg-emerald-500/20';
    } else if (color === 'warning') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-amber-500/40 cursor-not-allowed'
        : 'text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/20';
    } else if (color === 'error') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-red-500/40 cursor-not-allowed'
        : 'text-red-500 hover:bg-red-500/10 active:bg-red-500/20';
    } else if (color === 'info') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-sky-500/40 cursor-not-allowed'
        : 'text-sky-500 hover:bg-sky-500/10 active:bg-sky-500/20';
    } else {
      colorAndVariantClasses = finalIsDisabled 
        ? 'text-slate-400/50 cursor-not-allowed'
        : 'text-slate-300 hover:bg-slate-300/10';
    }
    // Add pressed state style for text buttons
    if (isPressed && !finalIsDisabled) {
      colorAndVariantClasses = colorAndVariantClasses.replace(/active:bg-[^\\s]+/, ''); // Remove active state if pressed is handled
      if (color === 'primary') colorAndVariantClasses += ' bg-indigo-500/20';
      else if (color === 'secondary') colorAndVariantClasses += ' bg-amber-500/20';
      else if (color === 'success') colorAndVariantClasses += ' bg-emerald-500/20';
      else if (color === 'warning') colorAndVariantClasses += ' bg-amber-500/20';
      else if (color === 'error') colorAndVariantClasses += ' bg-red-500/20';
      else if (color === 'info') colorAndVariantClasses += ' bg-sky-500/20';
      else colorAndVariantClasses += ' bg-slate-300/20';
    }
  }
  
  // Glass button styling
  else if (variant === 'glass') {
    if (color === 'primary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-indigo-500/10 text-indigo-500/40 border border-white/5 backdrop-blur-md cursor-not-allowed'
        : 'bg-indigo-500/10 hover:bg-indigo-500/20 active:bg-indigo-500/30 text-indigo-400 border border-white/10 hover:border-white/20 backdrop-blur-md';
    } else if (color === 'secondary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-amber-500/10 text-amber-500/40 border border-white/5 backdrop-blur-md cursor-not-allowed'
        : 'bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-400 border border-white/10 hover:border-white/20 backdrop-blur-md';
    } else {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-white/5 text-white/30 border border-white/5 backdrop-blur-md cursor-not-allowed'
        : 'bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/80 border border-white/10 hover:border-white/20 backdrop-blur-md';
    }
    // Add pressed state style for glass buttons
    if (isPressed && !finalIsDisabled) {
      colorAndVariantClasses = colorAndVariantClasses.replace(/active:bg-[^\\s]+/, ''); // Remove active state if pressed is handled
      if (color === 'primary') colorAndVariantClasses += ' bg-indigo-500/30';
      else if (color === 'secondary') colorAndVariantClasses += ' bg-amber-500/30';
      else colorAndVariantClasses += ' bg-white/15';
    }
  }
  
  // Gradient button styling
  else if (variant === 'gradient') {
    if (color === 'primary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-gradient-to-r from-indigo-500/40 to-purple-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg';
    } else if (color === 'secondary') {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg';
    } else {
      colorAndVariantClasses = finalIsDisabled 
        ? 'bg-gradient-to-r from-slate-700/40 to-slate-800/40 text-white/60 shadow-none cursor-not-allowed'
        : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-md hover:shadow-lg';
    }
    // Add pressed state style for gradient buttons
    if (isPressed && !finalIsDisabled) {
      // Slightly darken gradient on press
      if (color === 'primary') colorAndVariantClasses += ' from-indigo-700 to-purple-700';
      else if (color === 'secondary') colorAndVariantClasses += ' from-amber-600 to-orange-600';
      else colorAndVariantClasses += ' from-slate-800 to-slate-900';
    }
  }
  
  // Round or normal corner radius
  const roundedClass = rounded ? 'rounded-full' : 'rounded-[var(--radius-md)]';
  
  // Handle elevation
  const elevationClass = disableElevation ? 'shadow-none hover:shadow-none' : '';
  
  // Full width styling
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine classes
  const classes = `
    ${baseClasses}
    ${sizeClasses}
    ${colorAndVariantClasses}
    ${roundedClass}
    ${elevationClass}
    ${widthClass}
    ${className}
  `.trim();
  
  // Handle loading state
  const buttonContent = loading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {loadingText || children}
    </>
  ) : (
    <>
      {startIcon && <span className="mr-2 -ml-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 -mr-1">{endIcon}</span>}
    </>
  );
  
  // Correctly merge forwarded ref with internal ref
  React.useImperativeHandle(forwardedRef, () => ref.current as ButtonElement);

  // Render as link if href is provided
  if (elementType === 'a') {
    // For anchors, spread buttonProps (which includes href, target, rel, ARIA attrs, events)
    // Standard HTML attributes not relevant to links (like type, form, name, value) are not included.
    return (
      <a 
        {...buttonProps} // Spread ARIA/event props, href, target, rel
        ref={ref as React.RefObject<HTMLAnchorElement>} 
        className={classes} // Apply combined styles
        // style={buttonProps.style} // Apply style if needed, but className is preferred with Tailwind
      >
        {buttonContent}
      </a>
    );
  }
  
  // Render as button otherwise
  return (
    <button 
      {...buttonProps} // Spread ARIA attributes and event handlers
      ref={ref as React.RefObject<HTMLButtonElement>} 
      className={classes} // Apply combined styles
      // Apply standard HTML button attributes directly from component props
      type={type} 
      form={form}
      name={name}
      value={value}
      // disabled state is included in buttonProps via isDisabled
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 