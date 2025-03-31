// This file contains theme-related utilities and constants for Tailwind
// Since Tailwind handles most styling through classes, this is mostly for reference

// Define theme colors for reference and consistency
export const themeColors = {
  // Primary colors - updated with more vibrant purple/blue gradient
  primary: {
    main: '#6366f1', // Indigo 500
    light: '#818cf8', // Indigo 400
    dark: '#4f46e5', // Indigo 600
  },
  // Secondary colors - warmer accent color
  secondary: {
    main: '#f59e0b', // Amber 500
    light: '#fbbf24', // Amber 400
    dark: '#d97706', // Amber 600
  },
  // Background colors - darker and more sophisticated
  background: {
    default: '#0f172a', // Slate 900
    paper: '#1e293b', // Slate 800
    light: '#334155', // Slate 700
  },
  // Text colors - more contrast for improved readability
  text: {
    primary: '#f8fafc', // Slate 50
    secondary: '#cbd5e1', // Slate 300
    disabled: '#64748b', // Slate 500
  },
  // Status colors - brighter and more distinct
  status: {
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444',   // Red 500
    info: '#0ea5e9',    // Sky 500
  }
};

// Define breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Define spacing for consistent use
export const spacing = (space: number) => `${space * 0.25}rem`;

// Define font settings - update to modern font stack
export const typography = {
  fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Utility function to generate CSS variables
export const generateCssVars = () => {
  return {
    '--primary': themeColors.primary.main,
    '--primary-light': themeColors.primary.light,
    '--primary-dark': themeColors.primary.dark,
    '--secondary': themeColors.secondary.main,
    '--background': themeColors.background.default,
    '--paper': themeColors.background.paper,
  };
}; 