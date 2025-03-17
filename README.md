# Dementia Test App

This application is designed to assess cognitive function, particularly spatial awareness and visual perception, which are often affected in the early stages of dementia. The app presents users with a series of visual tests where they need to identify lines that match a given angle.

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Key Components](#key-components)
4. [How It Works](#how-it-works)
5. [Installation](#installation)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

## Features

- Interactive angle matching test with customizable parameters
- Configurable test settings:
  - Number of stimuli
  - Target angles per quadrant
  - Degree variance for options
  - Specific quadrant selection
- Fullscreen mode for distraction-free testing
- Results page with detailed performance metrics
- Responsive design for various device sizes
- Mobile-friendly interface

## Project Structure

- `app/`: Contains the main pages of the application
  - `page.tsx`: Home page with test start options
  - `test/page.tsx`: Test page where the actual assessment takes place
  - `results/page.tsx`: Results page displaying the test outcomes
  - `settings/page.tsx`: Settings page for customizing the test parameters
  - `layout.tsx`: Root layout with theme provider
  - `globals.css`: Global styles and Tailwind configuration
- `components/`: Contains reusable React components
  - `LineCanvas.tsx`: Renders the visual representation of angles
  - `FullscreenButton.tsx`: Toggles fullscreen mode
  - `ContextMenuWrapper.tsx`: Prevents default context menu behavior
  - `StyleWrapper.tsx`: Applies global styles and prevents text selection
  - `theme-provider.tsx`: Manages theme state (dark/light mode)
- `contexts/`: Contains React contexts
  - `SettingsContext.tsx`: Manages global settings state
- `hooks/`: Custom React hooks
  - `useFullscreen.ts`: Hook for managing fullscreen functionality
  - `use-mobile.tsx`: Hook for detecting mobile devices
  - `use-toast.ts`: Hook for managing toast notifications
- `lib/`: Utility functions and configurations
  - `utils.ts`: Common utility functions
  - `types.d.ts`: TypeScript type definitions

## Key Components

### LineCanvas
This component is responsible for rendering the lines at specified angles. It uses the HTML5 Canvas API for drawing and implements hover and click interactions. The component handles:
- Drawing lines at specified angles
- Interactive hover effects
- Click detection for angle selection
- Responsive canvas sizing

### SettingsContext
This context provides a global state for app settings, allowing them to be accessed and modified across different components. It manages:
- Number of stimuli
- Target angles configuration
- Degree variance settings
- Quadrant selection

### Test Component (in test/page.tsx)
This is the main component for conducting the test. It manages:
- Test state and progression
- User selection handling
- Timing measurements
- Results calculation
- Fullscreen mode integration

## How It Works

1. The user starts on the home page and can choose to start the test or adjust settings.
2. In the settings page, users can configure:
   - Number of stimuli to complete
   - Target angles for each quadrant
   - Degree variance for option angles
   - Whether to use specific quadrants
3. During the test:
   - Users are presented with a target angle
   - They must select the matching angle from multiple options
   - Each selection is timed and recorded
   - Progress is shown throughout the test
4. After completing all stimuli, users see their results, including:
   - Overall accuracy percentage
   - Average response time
   - Detailed breakdown of responses

## Installation

1. Clone the repository:
   git clone https://github.com/yourusername/DemTestFinal3.git
   
   cd DemTestFinal3

2. Install dependencies:

   npm install


3. Start the development server:
   npm run dev

4. Open http://localhost:3000 in your browser

## Deployment

The application is configured for deployment to GitHub Pages:

1. Push your changes to the main branch
2. GitHub Actions will automatically:
   - Build the application
   - Deploy to GitHub Pages
   - Update the live site