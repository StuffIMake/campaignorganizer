import React from 'react';

interface FormControlLabelProps {
  control: React.ReactElement;
  label: React.ReactNode;
  className?: string;
  disabled?: boolean;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  sx?: Record<string, any>;
}

const FormControlLabel: React.FC<FormControlLabelProps> = ({
  control,
  label,
  className = '',
  disabled = false,
  labelPlacement = 'end',
  sx = {},
  ...props
}) => {
  // Debug when component is rendered
  React.useEffect(() => {
    console.log('FormControlLabel component rendered', { label });
  }, [label]);

  // Clone the control element to pass down the disabled prop
  const controlElement = React.cloneElement(control, {
    disabled: disabled || control.props.disabled,
    // Important: preserve the original onChange handler
    onChange: control.props.onChange
  });

  // Determine the flex direction based on labelPlacement
  let flexDirection = 'row';
  if (labelPlacement === 'top') flexDirection = 'column-reverse';
  if (labelPlacement === 'bottom') flexDirection = 'column';
  if (labelPlacement === 'start') flexDirection = 'row-reverse';

  // Determine label spacing classes
  let labelSpacingClass = 'ml-2'; // default for end
  if (labelPlacement === 'start') labelSpacingClass = 'mr-2';
  if (labelPlacement === 'top') labelSpacingClass = 'mb-1';
  if (labelPlacement === 'bottom') labelSpacingClass = 'mt-1';

  // Convert sx to inline styles
  const inlineStyles: React.CSSProperties = {
    display: 'inline-flex', 
    flexDirection: flexDirection as any
  };

  // Handle common sx properties
  if (sx.mt) inlineStyles.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mb) inlineStyles.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.ml) inlineStyles.marginLeft = `${sx.ml * 0.25}rem`;
  if (sx.mr) inlineStyles.marginRight = `${sx.mr * 0.25}rem`;
  if (sx.m) {
    inlineStyles.margin = `${sx.m * 0.25}rem`;
  }

  return (
    <label
      className={`inline-flex ${flexDirection === 'row' || flexDirection === 'row-reverse' ? 'items-center' : 'items-start'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={inlineStyles}
      {...props}
    >
      {controlElement}
      <span className={`text-sm ${labelSpacingClass} ${disabled ? 'text-gray-500' : ''}`}>
        {label}
      </span>
    </label>
  );
};

FormControlLabel.displayName = 'FormControlLabel';

export default FormControlLabel; 