export interface User {
  id: string;
  email: string;
  full_name: string;
  work_hours_start: string;
  work_hours_end: string;
  work_days: string[];
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  created_at: string;
  user_id: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  client_id: string | null;
  user_id: string;
  created_at: string;
  clients?: {
    id: string;
    name: string;
    company: string;
  };
  files?: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  project_id: string;
  user_id: string;
  created_at: string;
  url?: string; // For temporarily storing public URL
  urlError?: string; // To track URL generation errors
}

export interface Note {
  id: string;
  title: string; // Added title field
  content: string;
  content_vector?: number[];
  client_id?: string;
  project_id?: string;
  user_id: string;
  created_at: string;
  similarity?: number; // For search results
}

export interface SearchResult {
  query: string;
  answer: string;
  relatedNotes: Note[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'project_data' | 'web_search' | null;
}

export interface ProjectChatResult {
  answer: string;
  relatedNotes: Note[];
  relatedFiles: ProjectFile[];
  source: 'project_data' | 'web_search';
  webSearchResults?: string;
}