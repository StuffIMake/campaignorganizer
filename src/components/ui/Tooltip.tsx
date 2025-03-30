import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 
                       'top-start' | 'top-end' | 
                       'bottom-start' | 'bottom-end' | 
                       'left-start' | 'left-end' | 
                       'right-start' | 'right-end';

interface TooltipProps {
  title: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  arrow?: boolean;
  delay?: number;
  className?: string;
  maxWidth?: string;
  color?: 'dark' | 'light' | 'primary';
  enterDelay?: number;
  leaveDelay?: number;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  arrow = true,
  className = '',
  maxWidth = '300px',
  color = 'dark',
  enterDelay = 100,
  leaveDelay = 0,
  open: controlledOpen,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const enterTimeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);
  
  // Handle controlled open state
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  
  // Get color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'light':
        return 'bg-white text-slate-800 border border-slate-200 shadow-md dark:bg-slate-200 dark:text-slate-800';
      case 'primary':
        return 'bg-primary-600 text-white';
      case 'dark':
      default:
        return 'bg-slate-800 text-white dark:bg-slate-900';
    }
  };
  
  // Get arrow color classes
  const getArrowColorClasses = () => {
    switch (color) {
      case 'light':
        return 'border-white dark:border-slate-200';
      case 'primary':
        return 'border-primary-600';
      case 'dark':
      default:
        return 'border-slate-800 dark:border-slate-900';
    }
  };
  
  // Clear any pending timeouts
  const clearTimeouts = () => {
    if (enterTimeoutRef.current) {
      window.clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    
    if (leaveTimeoutRef.current) {
      window.clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };
  
  // Handle hover events
  const handleMouseEnter = () => {
    clearTimeouts();
    
    if (!open) {
      enterTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(true);
        if (onOpen) onOpen();
      }, enterDelay);
    }
  };
  
  const handleMouseLeave = () => {
    clearTimeouts();
    
    if (open) {
      leaveTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
        if (onClose) onClose();
      }, leaveDelay);
    }
  };
  
  // Calculate tooltip and arrow position
  const updatePosition = () => {
    if (!anchorRef.current || !tooltipRef.current) return;
    
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const spacing = 8; // Space between tooltip and anchor
    const arrowSize = 6; // CSS border width of the arrow
    
    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;
    
    // Calculate position based on placement
    switch (placement) {
      case 'top':
        top = anchorRect.top - tooltipRect.height - spacing;
        left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
        arrowTop = tooltipRect.height - 1;
        arrowLeft = tooltipRect.width / 2 - arrowSize;
        break;
        
      case 'top-start':
        top = anchorRect.top - tooltipRect.height - spacing;
        left = anchorRect.left;
        arrowTop = tooltipRect.height - 1;
        arrowLeft = Math.min(anchorRect.width / 2, tooltipRect.width / 4);
        break;
        
      case 'top-end':
        top = anchorRect.top - tooltipRect.height - spacing;
        left = anchorRect.right - tooltipRect.width;
        arrowTop = tooltipRect.height - 1;
        arrowLeft = tooltipRect.width - Math.min(anchorRect.width / 2, tooltipRect.width / 4) - arrowSize * 2;
        break;
        
      case 'bottom':
        top = anchorRect.bottom + spacing;
        left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
        arrowTop = -arrowSize;
        arrowLeft = tooltipRect.width / 2 - arrowSize;
        break;
        
      case 'bottom-start':
        top = anchorRect.bottom + spacing;
        left = anchorRect.left;
        arrowTop = -arrowSize;
        arrowLeft = Math.min(anchorRect.width / 2, tooltipRect.width / 4);
        break;
        
      case 'bottom-end':
        top = anchorRect.bottom + spacing;
        left = anchorRect.right - tooltipRect.width;
        arrowTop = -arrowSize;
        arrowLeft = tooltipRect.width - Math.min(anchorRect.width / 2, tooltipRect.width / 4) - arrowSize * 2;
        break;
        
      case 'left':
        top = anchorRect.top + (anchorRect.height - tooltipRect.height) / 2;
        left = anchorRect.left - tooltipRect.width - spacing;
        arrowTop = tooltipRect.height / 2 - arrowSize;
        arrowLeft = tooltipRect.width - 1;
        break;
        
      case 'left-start':
        top = anchorRect.top;
        left = anchorRect.left - tooltipRect.width - spacing;
        arrowTop = Math.min(anchorRect.height / 2, tooltipRect.height / 4);
        arrowLeft = tooltipRect.width - 1;
        break;
        
      case 'left-end':
        top = anchorRect.bottom - tooltipRect.height;
        left = anchorRect.left - tooltipRect.width - spacing;
        arrowTop = tooltipRect.height - Math.min(anchorRect.height / 2, tooltipRect.height / 4) - arrowSize * 2;
        arrowLeft = tooltipRect.width - 1;
        break;
        
      case 'right':
        top = anchorRect.top + (anchorRect.height - tooltipRect.height) / 2;
        left = anchorRect.right + spacing;
        arrowTop = tooltipRect.height / 2 - arrowSize;
        arrowLeft = -arrowSize;
        break;
        
      case 'right-start':
        top = anchorRect.top;
        left = anchorRect.right + spacing;
        arrowTop = Math.min(anchorRect.height / 2, tooltipRect.height / 4);
        arrowLeft = -arrowSize;
        break;
        
      case 'right-end':
        top = anchorRect.bottom - tooltipRect.height;
        left = anchorRect.right + spacing;
        arrowTop = tooltipRect.height - Math.min(anchorRect.height / 2, tooltipRect.height / 4) - arrowSize * 2;
        arrowLeft = -arrowSize;
        break;
    }
    
    // Adjust position to keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal adjustment
    if (left < 10) {
      const diff = 10 - left;
      left = 10;
      // Adjust arrow position accordingly
      if (placement.startsWith('top') || placement.startsWith('bottom')) {
        arrowLeft -= diff;
      }
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      const diff = left + tooltipRect.width - (viewportWidth - 10);
      left = Math.max(10, viewportWidth - tooltipRect.width - 10);
      // Adjust arrow position accordingly
      if (placement.startsWith('top') || placement.startsWith('bottom')) {
        arrowLeft += diff;
      }
    }
    
    // Vertical adjustment
    if (top < 10) {
      const diff = 10 - top;
      top = 10;
      // Adjust arrow position accordingly
      if (placement.startsWith('left') || placement.startsWith('right')) {
        arrowTop -= diff;
      }
    } else if (top + tooltipRect.height > viewportHeight - 10) {
      const diff = top + tooltipRect.height - (viewportHeight - 10);
      top = Math.max(10, viewportHeight - tooltipRect.height - 10);
      // Adjust arrow position accordingly
      if (placement.startsWith('left') || placement.startsWith('right')) {
        arrowTop += diff;
      }
    }
    
    setPosition({ top, left });
    setArrowPosition({ top: arrowTop, left: arrowLeft });
  };
  
  // Clone the child element and attach ref and event handlers
  const childElement = React.cloneElement(React.Children.only(children), {
    ref: (node: HTMLElement) => {
      anchorRef.current = node;
      
      // Forward ref if the child has one
      const { ref } = children as any;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      
      // Forward the original onMouseEnter if it exists
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      
      // Forward the original onMouseLeave if it exists
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter();
      
      // Forward the original onFocus if it exists
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave();
      
      // Forward the original onBlur if it exists
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    }
  });
  
  // Update position when tooltip is opened or window resized
  useEffect(() => {
    if (open) {
      // Update position after a small delay to ensure tooltip is rendered
      const timer = setTimeout(() => {
        updatePosition();
      }, 10);
      
      // Listen for resize and scroll events
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [open]);
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);
  
  // Get the tooltip element
  const tooltipElement = open ? (
    createPortal(
      <div
        ref={tooltipRef}
        role="tooltip"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxWidth,
          zIndex: 1500,
        }}
        className={`
          py-1.5 px-2.5 rounded text-sm font-medium
          ${getColorClasses()}
          animate-fade-in
          ${className}
        `}
      >
        {arrow && (
          <div
            style={{
              position: 'absolute',
              top: `${arrowPosition.top}px`,
              left: `${arrowPosition.left}px`,
              width: 0,
              height: 0,
            }}
            className={`
              pointer-events-none
              ${getPlacementArrowClasses()}
            `}
          />
        )}
        {title}
      </div>,
      document.body
    )
  ) : null;
  
  // Get arrow classes based on placement
  function getPlacementArrowClasses() {
    // Base styles for the arrow
    const baseClasses = 'border-solid border-[6px]';
    
    // Add specific classes based on placement
    if (placement.startsWith('top')) {
      return `${baseClasses} border-l-transparent border-r-transparent border-b-transparent border-t-${getArrowColorClasses()}`;
    } else if (placement.startsWith('bottom')) {
      return `${baseClasses} border-l-transparent border-r-transparent border-t-transparent border-b-${getArrowColorClasses()}`;
    } else if (placement.startsWith('left')) {
      return `${baseClasses} border-t-transparent border-b-transparent border-r-transparent border-l-${getArrowColorClasses()}`;
    } else if (placement.startsWith('right')) {
      return `${baseClasses} border-t-transparent border-b-transparent border-l-transparent border-r-${getArrowColorClasses()}`;
    }
    
    return '';
  }
  
  return (
    <>
      {childElement}
      {tooltipElement}
    </>
  );
}; 