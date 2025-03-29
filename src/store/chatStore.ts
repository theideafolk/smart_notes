import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { searchSimilarNotes, generateAnswer } from '../services/searchService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'project_data' | 'web_search' | null;
  created_at: string;
  session_id: string;
  note_id?: string;
  pending?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface ChatState {
  sessions: ChatSession[];
  currentSession: string | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  createSession: (initialMessage: string) => Promise<string>;
  setCurrentSession: (sessionId: string) => void;
  fetchMessages: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, noteId?: string) => Promise<void>;
  clearSession: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  loading: false,
  error: null,

  clearSession: () => {
    set({
      currentSession: null,
      messages: []
    });
  },

  fetchSessions: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ sessions: data || [] });
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch chat sessions' });
    } finally {
      set({ loading: false });
    }
  },

  createSession: async (initialMessage: string) => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create title from first few words (max 5 words)
      const title = initialMessage
        .split(' ')
        .slice(0, 5)
        .join(' ')
        .trim() + '...';

      // Insert new session
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          title,
          user_id: user.id
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Insert initial message
      const { error: messageError } = await supabase
        .from('chat_history')
        .insert({
          role: 'user',
          content: initialMessage,
          user_id: user.id,
          session_id: sessionData.id
        });

      if (messageError) throw messageError;

      // Search notes and generate answer
      const relevantNotes = await searchSimilarNotes(initialMessage);
      const answer = await generateAnswer(initialMessage, relevantNotes);
      
      // Insert assistant message
      const { error: assistantError } = await supabase
        .from('chat_history')
        .insert({
          role: 'assistant',
          content: answer,
          source: 'project_data',
          user_id: user.id,
          session_id: sessionData.id
        });

      if (assistantError) throw assistantError;

      // Update state
      await get().fetchSessions();
      set({ currentSession: sessionData.id });
      await get().fetchMessages(sessionData.id);

      return sessionData.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create chat session' });
      return '';
    } finally {
      set({ loading: false });
    }
  },

  setCurrentSession: (sessionId: string) => {
    set({ currentSession: sessionId });
    get().fetchMessages(sessionId);
  },

  fetchMessages: async (sessionId: string) => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ messages: data || [] });
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch chat messages' });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content: string, noteId?: string) => {
    try {
      const timestamp = new Date().toISOString();
      const messageId = Date.now().toString();
      
      // Immediately add user message to UI
      set(state => ({
        messages: [...state.messages, {
          id: messageId,
          role: 'user',
          content,
          created_at: timestamp,
          session_id: state.currentSession || '',
          note_id: noteId
        }]
      }));

      set({ loading: true, error: null });
      const { currentSession } = get();
      
      if (!currentSession) {
        const sessionId = await get().createSession(content);
        if (!sessionId) throw new Error('Failed to create chat session');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert user message
      const { error: insertError } = await supabase
        .from('chat_history')
        .insert({
          role: 'user',
          content,
          user_id: user.id,
          session_id: currentSession,
          note_id: noteId
        });

      if (insertError) throw insertError;

      // Add pending state for assistant message
      const pendingAssistantId = (Date.now() + 1).toString();
      set(state => ({
        messages: [...state.messages, {
          id: pendingAssistantId,
          role: 'assistant',
          content: '...',
          created_at: new Date().toISOString(),
          session_id: currentSession,
          pending: true
        }]
      }));

      // Search notes and generate answer
      let relevantNotes: Note[];
      let answer: string;
      
      if (noteId) {
        // If a note is specified, only search within that note
        const { data: noteData } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single();
        
        if (!noteData) {
          answer = "I apologize, but I couldn't find the note you mentioned in the context. The note might have been deleted or you might not have access to it.";
        } else {
          // Only use the specified note for context
          const generatedAnswer = await generateAnswer(content, [noteData]);
          if (!generatedAnswer) {
            answer = "I couldn't find any relevant information in the attached note to answer your question. The information you're looking for might be in a different note. You can:\n\n" +
                    "1. Remove the note context (remove the @note mention) to search through all your notes\n" +
                    "2. Try mentioning a different note that might contain this information\n" +
                    "3. Try asking about a different topic that's covered in this note";
          } else {
            answer = generatedAnswer;
          }
        }
      } else {
        // Otherwise, search all notes
        relevantNotes = await searchSimilarNotes(content);
        if (!relevantNotes || relevantNotes.length === 0) {
          answer = "I couldn't find any relevant information in your notes to answer your question. Could you please rephrase your question or try asking about a different topic?";
        } else {
          const generatedAnswer = await generateAnswer(content, relevantNotes);
          answer = generatedAnswer || "I couldn't find any relevant information in your notes to answer your question. Could you please rephrase your question or try asking about a different topic?";
        }
      }
      
      // Insert assistant message
      const { error: assistantError } = await supabase
        .from('chat_history')
        .insert({
          role: 'assistant',
          content: answer,
          source: 'project_data',
          user_id: user.id,
          session_id: currentSession,
          note_id: noteId
        });

      if (assistantError) throw assistantError;

      // Update the pending message with actual content
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === pendingAssistantId
            ? { ...msg, content: answer, pending: false }
            : msg
        )
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send message' });
    } finally {
      set({ loading: false });
    }
  },
})); 