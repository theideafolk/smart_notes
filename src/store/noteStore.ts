import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { openai } from '../lib/openai';
import type { Note, SearchResult } from '../types';
import { searchSimilarNotes, generateAnswer } from '../services/searchService';

interface NoteState {
  notes: Note[];
  loading: boolean;
  searching: boolean;
  searchResult: SearchResult | null;
  error: string | null;
  fetchNotes: () => Promise<void>;
  fetchProjectNotes: (projectId: string) => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  createProjectNote: (title: string, content: string, projectId: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  clearSearchResult: () => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  searching: false,
  searchResult: null,
  error: null,

  fetchNotes: async () => {
    try {
      set({ loading: true, error: null });
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to view notes');
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchProjectNotes: async (projectId) => {
    if (!projectId) return;
    
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to view project notes');
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createNote: async (title: string, content: string) => {
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create notes');
      }

      // Initialize project_id and client_id to null
      const project_id = null;
      const client_id = null;

      // Generate embeddings for the content
      const response = await openai.embeddings.create({
        input: content,
        model: 'text-embedding-ada-002',
      });
      
      // Create note directly in the database
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: title,
          content: content,
          content_vector: response.data[0].embedding,
          user_id: user.id,
          project_id: project_id,
          client_id: client_id
        }])
        .select();

      if (error) {
        console.error('Create note error:', error);
        throw error;
      }
      
      await get().fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createProjectNote: async (title: string, content: string, projectId: string) => {
    if (!projectId) {
      set({ error: 'Project ID is required' });
      return;
    }

    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create notes');
      }

      // Initialize client_id to null
      const client_id = null;

      // Generate embeddings for the content
      const response = await openai.embeddings.create({
        input: content,
        model: 'text-embedding-ada-002',
      });
      
      // Create note directly in the database
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: title,
          content: content,
          content_vector: response.data[0].embedding,
          user_id: user.id,
          project_id: projectId,
          client_id: client_id
        }])
        .select();

      if (error) {
        console.error('Create project note error:', error);
        throw error;
      }
      
      await get().fetchProjectNotes(projectId);
    } catch (error) {
      console.error('Error creating project note:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateNote: async (id: string, title: string, content: string) => {
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update notes');
      }

      // Get the note first to check if it's a project note
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('project_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (noteError) {
        console.error('Error fetching note:', noteError);
        throw noteError;
      }

      // Generate new embeddings for the updated content
      const response = await openai.embeddings.create({
        input: content,
        model: 'text-embedding-ada-002',
      });

      // Update note directly in the database
      const { error } = await supabase
        .from('notes')
        .update({
          title: title,
          content: content,
          content_vector: response.data[0].embedding
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Update note error:', error);
        throw error;
      }
      
      // If it's a project note, fetch only project notes
      if (noteData?.project_id) {
        await get().fetchProjectNotes(noteData.project_id);
      } else {
        await get().fetchNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteNote: async (id: string) => {
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to delete notes');
      }

      // Call the delete_note RPC function
      const { error } = await supabase
        .rpc('delete_note', {
          note_id: id
        });
      
      if (error) {
        console.error('Delete note error:', error);
        throw error;
      }

      // Update the local state immediately
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      }));

      // Refresh the notes list
      await get().fetchNotes();
      
    } catch (error) {
      console.error('Error deleting note:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  searchNotes: async (query: string) => {
    try {
      set({ searching: true, error: null });
      
      // Find similar notes based on vector similarity
      const relevantNotes = await searchSimilarNotes(query);
      
      // Generate an answer based on the relevant notes
      const answer = await generateAnswer(query, relevantNotes);
      
      set({
        searchResult: {
          query,
          answer,
          relatedNotes: relevantNotes,
        },
      });
    } catch (error) {
      console.error('Search error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ searching: false });
    }
  },

  clearSearchResult: () => {
    set({ searchResult: null });
  },
}));