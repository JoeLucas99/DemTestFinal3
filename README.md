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

- Interactive angle matching test
- Customizable test settings (number of stimuli, angles per quadrant, etc.)
- Fullscreen mode for distraction-free testing
- Results page with performance summary
- Responsive design for various device sizes

## Project Structure

- `app/`: Contains the main pages of the application
  - `page.tsx`: Home page
  - `test/page.tsx`: Test page where the actual assessment takes place
  - `results/page.tsx`: Results page displaying the test outcomes
  - `settings/page.tsx`: Settings page for customizing the test parameters
- `components/`: Contains reusable React components
  - `LineCanvas.tsx`: Renders the visual representation of angles
  - `FullscreenButton.tsx`: Toggles fullscreen mode
  - `ContextMenuWrapper.tsx`: Prevents default context menu behavior
- `contexts/`: Contains React contexts
  - `SettingsContext.tsx`: Manages global settings state
- `hooks/`: Custom React hooks
  - `useFullscreen.ts`: Hook for managing fullscreen functionality

## Key Components

### LineCanvas
This component is responsible for rendering the lines at specified angles. It uses the HTML5 Canvas API for drawing and implements hover and click interactions.

### SettingsContext
This context provides a global state for app settings, allowing them to be accessed and modified across different components.

### Test Component (in test/page.tsx)
This is the main component for conducting the test. It manages the state of the current question, user selection, and test results.

## How It Works

1. The user starts on the home page and can choose to start the test or adjust settings.
2. During the test, the user is presented with a series of stimuli, each consisting of a target angle and multiple option angles.
3. The user must select the angle that matches the target angle.
4. After completing all stimuli, the user is shown their results, including accuracy and response times.

## Installation

1. Clone the repository:

