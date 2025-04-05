import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { openai } from '../lib/openai';
import { searchSimilarNotes, generateAnswer } from '../services/searchService';
import { generateAndStoreSummary } from '../components/NoteSummaryPanel';

export interface Note {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
  project_id?: string | null;
  client_id?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  query: string;
  answer: string;
  relatedNotes: Note[];
}

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  searching: boolean;
  searchResult: SearchResult | null;
  error: string | null;
  fetchNotes: () => Promise<void>;
  fetchProjectNotes: (projectId: string) => Promise<void>;
  fetchFolderNotes: (folderId: string) => Promise<void>;
  createNote: (title: string, content: string, folderId?: string | null) => Promise<Note | null>;
  createProjectNote: (title: string, content: string, projectId: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  clearSearchResult: () => void;
  setCurrentNote: (note: Note | null) => void;
  moveNote: (noteId: string, targetFolderId: string | null) => Promise<void>;
  copyNote: (noteId: string, targetFolderId: string | null) => Promise<Note | null>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
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

  fetchFolderNotes: async (folderId: string) => {
    if (!folderId) return;
    
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to view folder notes');
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('folder_id', folderId)
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

  createNote: async (title: string, content: string, folderId?: string | null) => {
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
          client_id: client_id,
          folder_id: folderId
        }])
        .select('id, title, content, folder_id, user_id, created_at, updated_at')
        .single();

      if (error) {
        console.error('Create note error:', error);
        throw error;
      }

      // Generate summary for the new note
      if (data) {
        try {
          await generateAndStoreSummary(data.id, content, true);
        } catch (summaryError) {
          console.error('Error generating summary:', summaryError);
          // Don't throw the error as the note was still created successfully
        }
      }
      
      if (folderId) {
        await get().fetchFolderNotes(folderId);
      } else {
        await get().fetchNotes();
      }
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      set({ error: (error as Error).message });
      return null;
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

      // Generate new summary for the updated note
      try {
        await generateAndStoreSummary(id, content, true);
      } catch (summaryError) {
        console.error('Error generating summary:', summaryError);
        // Don't throw the error as the note was still updated successfully
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

      // Delete the note summary first
      const { error: summaryError } = await supabase
        .from('note_summaries')
        .delete()
        .eq('note_id', id);

      if (summaryError) {
        console.error('Error deleting note summary:', summaryError);
        // Continue with note deletion even if summary deletion fails
      }

      // Call the delete_note RPC function to delete the note
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

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  moveNote: async (noteId: string, targetFolderId: string | null) => {
    try {
      const { error } = await supabase.rpc('move_note', {
        note_id: noteId,
        target_folder_id: targetFolderId
      });
      if (error) throw error;
      await get().fetchNotes();
    } catch (error) {
      console.error('Error moving note:', error);
      throw error;
    }
  },

  copyNote: async (noteId: string, targetFolderId: string | null) => {
    try {
      const { data, error } = await supabase.rpc('copy_note', {
        note_id: noteId,
        target_folder_id: targetFolderId
      });
      if (error) throw error;
      await get().fetchNotes();
      return data;
    } catch (error) {
      console.error('Error copying note:', error);
      throw error;
    }
  }
}));