import React, { useState, useRef, DragEvent } from 'react';

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  accept?: string;
  maxSize?: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFileDrop,
  accept = "*",
  maxSize,
  title = "Drag & Drop",
  description = "Drop files here or click to browse",
  icon,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Take only the first file
    const file = files[0];
    
    // Check file size if maxSize provided
    if (maxSize && file.size > maxSize) {
      alert(`File size exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`);
      return;
    }
    
    onFileDrop(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size if maxSize provided
    if (maxSize && file.size > maxSize) {
      alert(`File size exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`);
      return;
    }
    
    onFileDrop(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-[var(--radius-lg)] p-6 
        flex flex-col items-center justify-center 
        cursor-pointer transition-all duration-200
        ${isDragging ? 'border-primary-500 bg-primary-950/30 ring-4 ring-primary-900/20' : 'border-slate-700 bg-slate-900/30'} 
        hover:border-primary-600 hover:bg-slate-800/40
        group backdrop-blur-sm
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      {icon && (
        <div className={`text-slate-500 mb-3 transition-transform duration-200 group-hover:scale-110 ${isDragging ? 'text-primary-400 scale-110' : ''}`}>
          {icon}
        </div>
      )}
      
      <h4 className="text-lg font-medium text-white mb-1">
        {title}
      </h4>
      
      <p className="text-sm text-slate-400 text-center mb-2">
        {description}
      </p>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
      />
    </div>
  );
};

export default DropZone; 