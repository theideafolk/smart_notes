# Project File Structure and Purposes

## Root Directory Files

### Configuration Files
- `/.gitignore` - Git configuration file that specifies which files and directories should be ignored by version control
- `/.env` - Environment variables configuration file containing sensitive information and configuration settings
- `/vite.config.ts` - Vite bundler configuration file for the frontend application
- `/package.json` - Node.js project configuration file containing dependencies and scripts
- `/package-lock.json` - Locked versions of npm dependencies
- `/tsconfig.json` - Base TypeScript configuration file
- `/tsconfig.node.json` - TypeScript configuration for Node.js environment
- `/tsconfig.app.json` - TypeScript configuration for the application
- `/tailwind.config.js` - Tailwind CSS configuration file
- `/postcss.config.js` - PostCSS configuration file
- `/eslint.config.js` - ESLint configuration file for code linting

### Documentation
- `/README.md` - Project documentation and setup instructions

### Frontend Entry Points
- `/index.html` - Main HTML entry point for the frontend application

## Frontend Source (`src/`)

### Core Application Files
- `/src/App.tsx` - Main React application component
- `/src/main.tsx` - Application entry point that renders the root React component
- `/src/index.css` - Global CSS styles
- `/src/vite-env.d.ts` - TypeScript declarations for Vite environment

### Components (`/src/components/`)
- `/src/components/ProjectChat.tsx` - Component for project chat functionality
- `/src/components/FileUploader.tsx` - Component for handling file uploads
- `/src/components/ProjectFilesSection.tsx` - Component for displaying project files
- `/src/components/ProjectNotesSection.tsx` - Component for displaying project notes
- `/src/components/ProjectCard.tsx` - Component for displaying project information
- `/src/components/Layout.tsx` - Main layout component
- `/src/components/CreateProjectDialog.tsx` - Dialog for creating new projects
- `/src/components/ClientCard.tsx` - Component for displaying client information
- `/src/components/NoteSearch.tsx` - Component for searching notes
- `/src/components/NoteCard.tsx` - Component for displaying note information
- `/src/components/UserProfileForm.tsx` - Form for user profile management
- `/src/components/ProjectStatusBadge.tsx` - Component for displaying project status
- `/src/components/CreateNoteDialog.tsx` - Dialog for creating new notes
- `/src/components/CreateClientDialog.tsx` - Dialog for creating new clients
- `/src/components/AiAnswer.tsx` - Component for displaying AI-generated answers
- `/src/components/Editor.tsx` - Rich text editor component

### Pages (`/src/pages/`)
- `/src/pages/Dashboard.tsx` - Main dashboard page
- `/src/pages/Notes.tsx` - Notes management page
- `/src/pages/Calendar.tsx` - Calendar view page
- `/src/pages/Login.tsx` - User login page
- `/src/pages/Analytics.tsx` - Analytics dashboard page
- `/src/pages/Settings.tsx` - User settings page
- `/src/pages/Clients.tsx` - Client management page
- `/src/pages/Projects.tsx` - Project management page

### Services (`/src/services/`)
- `/src/services/searchService.ts` - Service for handling search functionality

### Store (`/src/store/`)
- `/src/store/projectStore.ts` - State management for projects
- `/src/store/noteStore.ts` - State management for notes
- `/src/store/clientStore.ts` - State management for clients
- `/src/store/authStore.ts` - State management for authentication

### Types (`/src/types/`)
- `/src/types/index.ts` - TypeScript type definitions

### Libraries (`/src/lib/`)
- `/src/lib/openai.ts` - OpenAI API integration
- `/src/lib/supabase.ts` - Supabase client configuration

## Backend API (`api/`)

### Core Backend Files
- `/api/main.py` - Main FastAPI application file containing API endpoints and business logic
- `/api/run.py` - Server startup script that runs the FastAPI application
- `/api/requirements.txt` - Python dependencies list

### Backend Directories
- `/api/venv/` - Python virtual environment directory
- `/api/Lib/` - Python library files
- `/api/__pycache__/` - Python bytecode cache directory

## Other Directories
- `/node_modules/` - Node.js dependencies
- `/supabase/` - Supabase-related configuration and files
- `/.bolt/` - Bolt-specific configuration and files
- `/.git/` - Git version control system files

## File Purposes Summary

### Frontend
The frontend is built using:
- React with TypeScript
- Vite as the build tool
- Tailwind CSS for styling
- ESLint for code quality

### Backend
The backend is built using:
- FastAPI (Python web framework)
- Uvicorn as the ASGI server
- Support for PDF and DOCX file processing (PyPDF2 and python-docx)

### Development Tools
- TypeScript for type safety
- ESLint for code linting
- PostCSS for CSS processing
- Git for version control
- Supabase for backend services 