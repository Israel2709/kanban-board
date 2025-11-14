# Kanban Board

A modern Kanban board application built with React, Vite, Tailwind CSS, and Firebase.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Backend services (Authentication, Realtime Database, Storage)
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management
- **date-fns** - Date utility library
- **react-icons** - Icon library
- **classnames** - Conditional className utility
- **React Context API** - State management

## Project Structure

```
src/
├── firebase/
│   └── config.js          # Firebase configuration
├── context/
│   └── AppContext.jsx      # Global state management
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── index.css              # Global styles with Tailwind
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Firebase Configuration

Firebase is configured in `src/firebase/config.js`. The configuration includes:
- Authentication
- Realtime Database
- Storage

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
