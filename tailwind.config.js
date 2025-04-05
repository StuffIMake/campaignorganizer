/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rich dark theme palette with subtle gradations
        primary: {
          light: '#9333ea', // Vibrant purple - Highlights and accents
          DEFAULT: '#7928ca', // Rich purple - Primary interactive elements
          dark: '#5b21b6', // Deep purple - Depth/shadows on primary
        },
        secondary: {
          light: '#0ea5e9', // Bright blue - Secondary accents
          DEFAULT: '#0284c7', // Ocean blue - Secondary elements
          dark: '#0c4a6e', // Deep blue - Depth on secondary
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber gold - Attention-grabbing accents
          dark: '#b45309', // Deep amber - Hover states for accent
        },
        // Dark-mode optimized text
        text: {
          primary: '#f1f5f9', // Almost white - Main text
          secondary: '#94a3b8', // Light slate - Secondary/dimmed text
          light: '#64748b', // Mid slate - Placeholder/disabled text
          dark: '#1e293b', // Dark slate - For light surfaces
        },
        // Dark backgrounds with subtle color
        background: {
          DEFAULT: '#080c13', // Near black with blue tint - Main background
          alt: '#0f172a', // Navy black - Secondary background/cards
          surface: '#131c31', // Deep blue-gray - Surfaces/panels
          elevated: '#1a2541', // Slightly lighter blue-gray - Elevated components
        },
        border: {
          DEFAULT: '#1e293b', // Dark slate - Standard borders
          light: '#334155', // Medium slate - Higher contrast borders
          focus: '#9333ea', // Purple - Focus states
        },
        success: {
          DEFAULT: '#10b981', // Emerald - Success states
          light: '#d1fae5', // Light emerald - Success backgrounds
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber - Warning states
          light: '#fef3c7', // Light amber - Warning backgrounds
        },
        error: {
          DEFAULT: '#ef4444', // Red - Error states
          light: '#fee2e2', // Light red - Error backgrounds
        },
        info: {
          DEFAULT: '#3b82f6', // Blue - Information states
          light: '#dbeafe', // Light blue - Information backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'pill': '9999px',
      },
      boxShadow: {
        // Tailored for dark mode with more subtle shadows
        'sm': '0 2px 4px 0 rgba(0, 0, 0, 0.7)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.35)',
        'glow': '0 0 15px rgba(147, 51, 234, 0.5)',
        'glow-blue': '0 0 15px rgba(14, 165, 233, 0.5)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
      },
      // More refined spacing scale for modern layouts
      spacing: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '192': '48rem',
      },
      // Enhanced animations for UI interactions
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(147, 51, 234, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.8)' },
        },
      },
      // Modern backdrop blur effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '36px',
      },
    },
  },
  plugins: [],
} 