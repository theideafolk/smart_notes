import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Folder {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  isEditing?: boolean;
  isSelected?: boolean;
}

interface FolderState {
  folders: Folder[];
  selectedFolderId: string | null;
  fetchFolders: () => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<Folder | null>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setFolderEditing: (id: string, isEditing: boolean) => void;
  setSelectedFolder: (id: string | null) => void;
  moveFolder: (folderId: string, targetParentId: string | null) => Promise<void>;
  copyFolder: (folderId: string, targetParentId: string | null) => Promise<Folder | null>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  selectedFolderId: null,

  fetchFolders: async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_folders');
      if (error) throw error;
      set({ folders: data });
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  createFolder: async (name: string, parentId?: string | null) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('create_folder', {
        user_id: user.id,
        folder_name: name,
        folder_description: null,
        parent_folder_id: parentId
      });
      if (error) throw error;
      await get().fetchFolders();
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  updateFolder: async (id: string, name: string) => {
    try {
      const { error } = await supabase.rpc('update_folder', {
        folder_id: id,
        folder_name: name
      });
      if (error) throw error;
      await get().fetchFolders();
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  deleteFolder: async (id: string) => {
    try {
      const { error } = await supabase.rpc('delete_folder', {
        folder_id: id
      });
      if (error) throw error;
      await get().fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  setFolderEditing: (id: string, isEditing: boolean) => {
    set(state => ({
      folders: state.folders.map(folder =>
        folder.id === id ? { ...folder, isEditing } : folder
      )
    }));
  },

  setSelectedFolder: (id: string | null) => {
    set({ selectedFolderId: id });
  },

  moveFolder: async (folderId: string, targetParentId: string | null) => {
    try {
      const { error } = await supabase.rpc('move_folder', {
        folder_id: folderId,
        target_parent_id: targetParentId
      });
      if (error) throw error;
      await get().fetchFolders();
    } catch (error) {
      console.error('Error moving folder:', error);
      throw error;
    }
  },

  copyFolder: async (folderId: string, targetParentId: string | null) => {
    try {
      const { data, error } = await supabase.rpc('copy_folder', {
        folder_id: folderId,
        target_parent_id: targetParentId
      });
      if (error) throw error;
      await get().fetchFolders();
      return data;
    } catch (error) {
      console.error('Error copying folder:', error);
      throw error;
    }
  }
})); 