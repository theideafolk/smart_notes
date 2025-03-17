import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Project, ProjectFile, ChatMessage } from '../types';
import { generateProjectAnswer } from '../services/searchService';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  chatMessages: Record<string, ChatMessage[]>; // projectId -> messages
  chatLoading: boolean;
  chatError: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string, clientId?: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStatus: (id: string, status: Project['status']) => Promise<void>;
  uploadFile: (projectId: string, file: File) => Promise<void>;
  deleteFile: (fileId: string, filePath: string) => Promise<void>;
  sendChatMessage: (projectId: string, content: string) => Promise<void>;
  clearChatMessages: (projectId: string) => void;
}

// Fix error handling for storage errors
const handleStorageError = (error: any): string => {
  if (error && typeof error === 'object') {
    if ('message' in error) return error.message;
    if ('error' in error) return String(error.error);
    if ('statusCode' in error) return `Storage error (${error.statusCode})`;
  }
  return 'An unknown error occurred';
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  chatMessages: {},
  chatLoading: false,
  chatError: null,

  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      
      // First, get all projects with their clients
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            id,
            name,
            company
          )
        `)
        .order('created_at', { ascending: false });

      if (projectError) {
        console.error('Error fetching projects:', projectError);
        throw projectError;
      }
      
      const projects = projectData || [];
      
      // For each project, get its files
      const projectsWithFiles = await Promise.all(
        projects.map(async (project) => {
          const { data: fileData, error: fileError } = await supabase
            .from('project_files')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false });
            
          if (fileError) {
            console.error(`Error fetching files for project ${project.id}:`, fileError);
            return project;
          }
          
          // If there are files, try to get their public URLs with retry logic
          const filesWithUrls = await Promise.all(
            (fileData || []).map(async (file) => {
              try {
                // Try to get the signed URL with retry logic
                for (let attempt = 0; attempt < 2; attempt++) {
                  try {
                    const { data: urlData, error: urlError } = await supabase
                      .storage
                      .from('project-files')
                      .createSignedUrl(file.file_path, 60 * 60); // URL valid for 1 hour
                      
                    if (urlError) {
                      // If it's a timeout error, retry after a short delay
                      const errorMessage = String(urlError.message || '').toLowerCase();
                      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
                        console.warn('Storage timeout, retrying...', attempt + 1);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                        continue; // Try again
                      }
                      
                      console.error('Error creating signed URL:', urlError);
                      return { ...file, url: null, urlError: urlError.message };
                    }
                    
                    return {
                      ...file,
                      url: urlData?.signedUrl || null
                    };
                  } catch (innerError) {
                    // If we're on the last attempt, propagate the error
                    if (attempt === 1) throw innerError;
                    
                    // Otherwise retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
                
                // If we get here without returning, we failed all retries
                return { ...file, url: null, urlError: 'Failed after retries' };
              } catch (error: any) {
                console.error('Error processing file URL:', error);
                return { 
                  ...file, 
                  url: null, 
                  urlError: typeof error === 'string' ? error : error?.message || 'Unknown error' 
                };
              }
            })
          );
          
          return {
            ...project,
            files: filesWithUrls
          };
        })
      );
      
      set({ projects: projectsWithFiles });
    } catch (error: any) {
      console.error('Error in fetchProjects:', error);
      set({ error: error?.message || 'Failed to fetch projects' });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (name, description, clientId) => {
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create projects');
      }

      // Use an RPC function to bypass RLS
      const { data, error } = await supabase.rpc('create_project', {
        project_name: name,
        project_description: description,
        project_client_id: clientId || null,
        project_user_id: user.id
      });

      if (error) {
        console.error('Create project error:', error);
        throw error;
      }
      
      await get().fetchProjects();
    } catch (error: any) {
      console.error('Error in createProject:', error);
      set({ error: error?.message || 'Failed to create project' });
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (id, updates) => {
    try {
      set({ loading: true, error: null });

      // Use an RPC function to bypass RLS
      const { error } = await supabase.rpc('update_project', {
        project_id: id,
        project_name: updates.name,
        project_description: updates.description,
        project_status: updates.status,
        project_client_id: updates.client_id
      });

      if (error) {
        console.error('Update project error:', error);
        throw error;
      }
      
      await get().fetchProjects();
    } catch (error: any) {
      console.error('Error in updateProject:', error);
      set({ error: error?.message || 'Failed to update project' });
    } finally {
      set({ loading: false });
    }
  },

  updateProjectStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });

      // Use an RPC function to bypass RLS
      const { error } = await supabase.rpc('update_project_status', {
        project_id: id,
        project_status: status
      });

      if (error) {
        console.error('Update project status error:', error);
        throw error;
      }
      
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, status } : project
        )
      }));
    } catch (error: any) {
      console.error('Error in updateProjectStatus:', error);
      set({ error: error?.message || 'Failed to update project status' });
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // Use an RPC function to bypass RLS
      const { error } = await supabase.rpc('delete_project', {
        project_id: id
      });
      
      if (error) {
        console.error('Delete project error:', error);
        throw error;
      }
      
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }));
    } catch (error: any) {
      console.error('Error in deleteProject:', error);
      set({ error: error?.message || 'Failed to delete project' });
    } finally {
      set({ loading: false });
    }
  },

  uploadFile: async (projectId, file) => {
    try {
      set({ loading: true, error: null });
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${projectId}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);
        
      if (uploadError) {
        throw new Error(handleStorageError(uploadError));
      }
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);
      
      // Create the file record using the RPC function
      const { data: fileId, error: rpcError } = await supabase.rpc('create_project_file', {
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        project_id: projectId,
        file_user_id: user.id
      });
      
      if (rpcError) {
        // If there was an error creating the record, try to delete the uploaded file
        try {
          await supabase.storage
            .from('project-files')
            .remove([filePath]);
        } catch (removeError) {
          console.error('Failed to remove file after database error:', removeError);
        }
        
        throw new Error(`Database error: ${rpcError.message}`);
      }
      
      // Fetch the created file to get all its details
      const { data: fileData, error: fetchError } = await supabase
        .from('project_files')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        throw new Error(`Error fetching file data: ${fetchError.message}`);
      }
      
      // Update local state
      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              files: [...(p.files || []), fileData],
            };
          }
          return p;
        }),
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to upload file' });
    } finally {
      set({ loading: false });
    }
  },

  deleteFile: async (fileId, filePath) => {
    try {
      set({ loading: true, error: null });
      
      // Delete the file record using the RPC function
      const { error: rpcError } = await supabase.rpc('delete_project_file', {
        file_id: fileId
      });
      
      if (rpcError) {
        throw new Error(`Failed to delete file record: ${rpcError.message}`);
      }
      
      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([filePath]);
        
      if (storageError) {
        console.warn('Warning: File removed from database but not from storage:', storageError);
      }
      
      // Update local state
      set((state) => ({
        projects: state.projects.map((project) => ({
          ...project,
          files: (project.files || []).filter((file) => file.id !== fileId),
        })),
      }));
    } catch (error) {
      console.error('Error deleting file:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete file' });
    } finally {
      set({ loading: false });
    }
  },

  // Add chat functionality
  sendChatMessage: async (projectId, message) => {
    try {
      set((state) => ({
        chatLoading: true,
        chatError: null,
        chatMessages: {
          ...state.chatMessages,
          [projectId]: [
            ...(state.chatMessages[projectId] || []),
            {
              id: Date.now().toString(),
              role: 'user',
              content: message,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      }));

      // Generate answer
      const result = await generateProjectAnswer(message, projectId);

      // Add assistant message
      set((state) => ({
        chatLoading: false,
        chatMessages: {
          ...state.chatMessages,
          [projectId]: [
            ...(state.chatMessages[projectId] || []),
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: result.answer,
              timestamp: new Date().toISOString(),
              source: result.source,
            },
          ],
        },
      }));
    } catch (error) {
      console.error('Error sending chat message:', error);
      set((state) => ({
        chatLoading: false,
        chatError: error instanceof Error ? error.message : 'Failed to send message',
        chatMessages: {
          ...state.chatMessages,
          [projectId]: [
            ...(state.chatMessages[projectId] || []),
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Sorry, I encountered an error while processing your request.',
              timestamp: new Date().toISOString(),
            },
          ],
        },
      }));
    }
  },
  
  clearChatMessages: (projectId) => {
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [projectId]: [],
      },
    }));
  }
}));