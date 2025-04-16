# Jira Mock

A modern Jira mockup application built with React, TypeScript, and Tailwind CSS. This application provides a simplified version of Jira's core features, focusing on agile project management.

## Features

- Dashboard with sprint progress tracking
- Backlog management with filtering options
- Kanban-style sprint board
- Issue tracking with different types (Story, Bug, Task)
- Priority and status management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

## Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
  - `pages/` - Page components
    - `Dashboard.tsx` - Main dashboard view
    - `Backlog.tsx` - Backlog management
    - `SprintBoard.tsx` - Kanban board view
  - `App.tsx` - Main application component
  - `main.tsx` - Application entry point

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Router
- Vite 