import React, { forwardRef, useRef } from 'react';
import { useSelectState, Item as ReactStatelyItem, useOverlayTriggerState } from 'react-stately';
import { 
  useSelect, 
  useButton, 
  useListBox, 
  useOption, 
  HiddenSelect, // For native select accessibility
  useOverlay,    // For popover positioning
  useOverlayPosition, // For positioning the popover
  FocusScope,    // For focus trapping in popover
  mergeProps     // Utility for merging props
} from 'react-aria';
import { ExpandMoreIcon } from '../../assets/icons';
import { List } from './List'; // Keep List for styling?
import Paper from './Paper'; // Keep Paper for popover styling
import type { AriaSelectProps } from '@react-types/select';
import type { SelectState, OverlayTriggerState } from 'react-stately';
import type { Node } from '@react-types/shared';
import type { AriaListBoxProps } from '@react-types/listbox'; // Changed to AriaListBoxProps
import type { Key } from '@react-types/shared'; // Import Key type from React Aria

// Export Item directly - this is the correct component to use for menu options
// when using the React Aria/Stately select system
export const Item = ReactStatelyItem;

// Define props extending AriaSelectProps
// We need to handle label, description, errorMessage etc.
export interface SelectProps<T extends object> extends AriaSelectProps<T> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string; // For outer wrapper
  buttonClassName?: string; // For the trigger button
  popoverClassName?: string; // For the popover
  // Retain styling/layout props if needed
  fullWidth?: boolean;
  error?: boolean; // For visual styling
}

// Helper component for each option
function Option<T extends object>({ item, state }: { item: Node<object>, state: SelectState<object> }) {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, isSelected, isFocused, isDisabled } = useOption(
    { key: item.key },
    state,
    ref
  );

  // Example Styling (Adjust to match your MenuItem styles)
  const selectedClass = isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' : 'text-slate-900 dark:text-white';
  const focusedClass = isFocused ? 'bg-slate-100 dark:bg-slate-700' : '';
  const disabledClass = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700';

  return (
    <li
      {...optionProps}
      ref={ref}
      className={`px-4 py-2 text-sm outline-none ${selectedClass} ${focusedClass} ${disabledClass}`}
    >
      {item.rendered}
    </li>
  );
}

// --- ListBox Component (Popover Content) ---
// Updated interface to extend AriaListBoxProps but OMIT children
interface ListBoxProps extends Omit<AriaListBoxProps<object>, 'children'> { 
  state: SelectState<object>;
}
function ListBox(props: ListBoxProps) {
  const { state } = props;
  const ref = useRef<HTMLUListElement>(null); 
  const { listBoxProps } = useListBox(props, state, ref);

  return (
    // Using List component for base ul styling
    <List {...listBoxProps} ref={ref} disablePadding>
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </List>
  );
}

// --- Popover Component ---
// Handles overlay logic for the ListBox
interface PopoverProps {
  children: React.ReactNode;
  state: OverlayTriggerState; // Use imported OverlayTriggerState type
  triggerRef: React.RefObject<Element>;
  popoverRef: React.RefObject<HTMLDivElement>;
  className?: string;
}
function Popover(props: PopoverProps) {
  const { state, triggerRef, popoverRef, children, className } = props;

  // Get popover positioning props
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: popoverRef,
    placement: 'bottom start',
    offset: 8,
    isOpen: state.isOpen
  });

  // Get overlay props
  const { overlayProps } = useOverlay(
    { 
      isOpen: state.isOpen, 
      onClose: state.close, 
      shouldCloseOnBlur: true, 
      isDismissable: true 
    },
    popoverRef
  );

  return (
    <FocusScope restoreFocus>
      <Paper 
        {...mergeProps(overlayProps, positionProps)} 
        ref={popoverRef} 
        className={`absolute z-20 w-full mt-1 shadow-lg border border-slate-300 dark:border-slate-600 rounded-md ${className || ''}`}
        sx={{ maxHeight: 300, overflow: 'auto' }} // sx needs Paper to support it
      >
        {children}
      </Paper>
    </FocusScope>
  );
}

// --- Main Select Component ---
// Needs generic type T
export function Select<T extends object>(
  // Destructure styling props, pass rest (`hookProps`) to hooks
  { 
    className,
    buttonClassName,
    popoverClassName,
    error,
    fullWidth,
    ...hookProps // Pass remaining AriaSelectProps to hooks
  }: SelectProps<T>
) {
  // Transform any selectedKey to match our data-value pattern
  const transformedProps = {
    ...hookProps,
    // Ensure the selectedKey matches the format used in MenuItem (data-value)
    selectedKey: hookProps.selectedKey ? String(hookProps.selectedKey) : undefined,
    // Transform the onSelectionChange handler to convert data-values back to the expected format
    onSelectionChange: hookProps.onSelectionChange 
      ? (key: Key) => {
          // If onChange expects a specific type (like number), convert the key
          const originalKey = hookProps.selectedKey;
          const newKey = typeof originalKey === 'number' ? Number(key) : key;
          hookProps.onSelectionChange?.(newKey);
        }
      : undefined
  };
  
  // --- State and Refs ---
  // useSelectState handles props.children (if <Item>) or props.items
  const state = useSelectState(transformedProps); 
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const overlayState = useOverlayTriggerState({ isOpen: state.isOpen, onOpenChange: state.setOpen });

  // --- Hook Calls ---
  const { labelProps, triggerProps, valueProps, menuProps, descriptionProps, errorMessageProps } = useSelect(
    transformedProps, 
    state,
    triggerRef
  );

  const { buttonProps } = useButton(triggerProps, triggerRef);

  // --- StyLING ---
  const errorClass = error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600';
  // Use hookProps.isDisabled for styling the button
  const disabledClass = hookProps.isDisabled ? 'opacity-50 cursor-not-allowed' : ''; 
  const wrapperClass = className || '';
  const btnClass = buttonClassName || ''; 
  const popClass = popoverClassName || ''; 

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${wrapperClass}`}>
      {hookProps.label && (
        <label {...labelProps} className="block text-sm font-medium text-slate-300 mb-1.5">
          {hookProps.label}
        </label>
      )}
      
      {/* Hidden select for form submission and some accessibility */}
      <HiddenSelect 
        state={state} 
        triggerRef={triggerRef} 
        label={hookProps.label} 
        name={hookProps.name} 
        isDisabled={hookProps.isDisabled} 
      />

      {/* Trigger Button */}
      <button
        {...buttonProps}
        ref={triggerRef}
        className={`
          relative flex items-center justify-between w-full px-3 py-2 
          bg-white dark:bg-slate-800 
          border ${errorClass} rounded-md 
          text-left text-sm text-slate-900 dark:text-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/70
          ${disabledClass} ${btnClass}
        `}
      >
        <span {...valueProps} className="truncate">
          {state.selectedItem
            ? state.selectedItem.rendered // Display rendered content from selected item
            : <span className="text-slate-500">{hookProps.placeholder || 'Select an option'}</span>}
        </span>
        <ExpandMoreIcon 
          className={`flex-shrink-0 ml-2 transition-transform ${state.isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true" 
        />
      </button>

      {/* Popover with ListBox */}
      {overlayState.isOpen && (
        <Popover 
          state={overlayState} 
          triggerRef={triggerRef} 
          popoverRef={popoverRef}
          className={popClass}
        >
          <ListBox 
            {...menuProps} // Spread menuProps onto ListBox
            state={state} 
            // Pass label/description/etc. if needed by useListBox internally
            // aria-labelledby={labelProps.id} // menuProps likely handles this
            // autoFocus handled by FocusScope + useListBox
          />
        </Popover>
      )}

      {/* Description/Error Messages using props from useSelect */}
      {hookProps.description && !hookProps.errorMessage && (
         <p {...descriptionProps} className="text-xs mt-1.5 text-slate-400">
          {hookProps.description}
        </p>
      )}
      {hookProps.errorMessage && (
         <p {...errorMessageProps} className="text-xs mt-1.5 text-red-500">
          {hookProps.errorMessage}
        </p>
      )}
    </div>
  );
}

// Note: Since we are using hooks that require state management,
// forwardRef might not be directly applicable in the same way as simple components.
// The main interaction points are the trigger button and the listbox items.
// If a ref is needed on the outer div, it would need careful handling.

// Export the component directly without forwardRef for now
// export default Select; 