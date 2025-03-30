// This file contains theme-related utilities and constants for Tailwind
// Since Tailwind handles most styling through classes, this is mostly for reference

// Define theme colors for reference and consistency
export const themeColors = {
  // Primary colors
  primary: {
    main: '#7c4dff',
    light: '#b47cff',
    dark: '#3f1dcb',
  },
  // Secondary colors
  secondary: {
    main: '#ff9800',
    light: '#ffac33',
    dark: '#c66900',
  },
  // Background colors
  background: {
    default: '#1a1a1a',
    paper: '#2d2d2d',
    light: '#3a3a3a',
  },
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    disabled: '#6c6c6c',
  },
  // Status colors
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
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

// Define font settings
export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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