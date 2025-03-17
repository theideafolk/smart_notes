# SmartNotes - AI-Powered Project Management

SmartNotes is a productivity application that helps you manage projects, tasks, and notes with AI assistance.

## Features

- Intelligent PDF parsing using Supabase Edge Functions
- AI-powered task extraction from documents
- Project management system with client tracking
- Vector-based semantic search across notes
- Tailwind CSS and React-based UI

## Edge Function Setup

This project uses Supabase Edge Functions to process PDF files serverside. To set it up:

1. Install Supabase CLI globally
```bash
npm install -g supabase
```

2. Login to Supabase
```bash
supabase login
```

3. Link to your Supabase project
```bash
supabase link --project-ref your-project-ref
```

4. Deploy the edge function
```bash
npm run supabase:functions:deploy
```

## Environment Variables

Create a `.env` file with:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```