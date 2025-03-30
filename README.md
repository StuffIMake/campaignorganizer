# Campaign Organizer

A sleek, modern web application for tabletop RPG game masters to organize campaign information, including locations, characters, and combats.

## Features

- **Modern UI**: Beautiful, responsive interfaces with subtle animations and transitions
- **Dark Mode Support**: Full dark mode support with proper color theming
- **Locations Management**: Create, edit, and organize locations with connections and descriptions
- **Characters Management**: Manage NPCs, enemies, merchants, and player characters
- **Inventory System**: Track items, equipment, and loot
- **Combat Tracker**: Organize combat encounters with initiative tracking
- **Local Storage**: All data is stored locally in your browser using IndexedDB
- **Export/Import**: Export your campaign data as a zip file for backup or sharing

## Design System

The Campaign Organizer uses a custom modern design system with a focus on sleek, clean interfaces with subtle animations and transitions.

### Components

- **Navigation**: Responsive navigation with smooth transitions and intelligent scrolling behavior
- **Card**: Versatile card component with hover effects, variants, and animations
- **Button**: Modern buttons with multiple variants, loading states, and interactions
- **Dialog**: Modal dialogs with smooth animations and backdrop effects
- **Alert**: Notification component with multiple severity levels and variants
- **Tooltip**: Accurate tooltip positioning with smooth animations
- **Chip**: Tag-like components for displaying compact information
- **Box**: Responsive layout component with flexible styling options
- **AppLoader**: Animated loading indicator for asynchronous operations

### Animations

The application includes custom animations for a polished user experience:

- Smooth page transitions
- Loading states with subtle animations
- Hover interactions on interactive elements
- Modern form interactions
- Dialog entry/exit animations
- Alert notifications with smooth entrance effects

### Dark Mode

The application supports full dark mode with carefully designed color schemes for both light and dark themes. The system respects user system preferences for theme selection.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:3000`

## Usage

### Locations

Create and manage locations for your campaign world. Connect locations to establish geographic relationships. Add rich descriptions using Markdown.

### Characters

Track NPCs, enemies, merchants, and player characters. Manage their stats, descriptions, and inventories. Assign characters to locations.

### Combat

Set up combat encounters with an initiative tracker. Add characters to combat and track their health and status effects.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Router
- IndexedDB (for local storage)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Designed and built for tabletop RPG enthusiasts
- Inspired by the needs of game masters running complex campaigns
