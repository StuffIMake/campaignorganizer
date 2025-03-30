import React, { useEffect, useRef, useState } from 'react';

interface CollapseProps {
  children: React.ReactNode;
  in: boolean;
  timeout?: number;
  className?: string;
}

const Collapse: React.FC<CollapseProps> = ({
  children,
  in: isOpen,
  timeout = 300,
  className = '',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, timeout);
    }
  }, [isOpen, timeout]);

  useEffect(() => {
    if (isOpen) {
      // Set initial height for transition
      setHeight(contentRef.current?.scrollHeight || 0);
      
      // After transition completes, set height to 'auto' to handle content changes
      const timer = setTimeout(() => {
        setHeight('auto');
      }, timeout);
      
      return () => clearTimeout(timer);
    } else {
      // Set the current height before collapsing
      if (contentRef.current) {
        const currentHeight = contentRef.current.scrollHeight;
        setHeight(currentHeight);
        
        // Force a reflow
        contentRef.current.offsetHeight;
        
        // Set height to 0 to animate collapse
        setTimeout(() => {
          setHeight(0);
        }, 10);
      }
    }
  }, [isOpen, timeout]);

  const style: React.CSSProperties = {
    height: height === 'auto' ? 'auto' : `${height}px`,
    overflow: 'hidden',
    transition: `height ${timeout}ms ease-in-out`,
  };

  if (!isVisible && height === 0) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
};

export default Collapse; 