import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Client } from '../types';

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  createClient: (name: string, company: string, email: string, phone: string) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      set({ clients: data || [] });
    } catch (error) {
      console.error('Error in fetchClients:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createClient: async (name, company, email, phone) => {
    try {
      set({ loading: true, error: null });

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create clients');
      }

      // Use an RPC function to bypass RLS
      const { data, error } = await supabase.rpc('create_client', {
        client_name: name,
        client_company: company,
        client_email: email,
        client_phone: phone,
        client_user_id: user.id
      });

      if (error) {
        console.error('Create client error:', error);
        throw error;
      }
      
      await get().fetchClients();
    } catch (error) {
      console.error('Error in createClient:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (id, updates) => {
    try {
      set({ loading: true, error: null });

      // Use an RPC function to bypass RLS
      const { error } = await supabase.rpc('update_client', {
        client_id: id,
        client_name: updates.name,
        client_company: updates.company,
        client_email: updates.email,
        client_phone: updates.phone
      });

      if (error) {
        console.error('Update client error:', error);
        throw error;
      }
      
      await get().fetchClients();
    } catch (error) {
      console.error('Error in updateClient:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // Use an RPC function to bypass RLS
      const { error } = await supabase.rpc('delete_client', {
        client_id: id
      });
      
      if (error) {
        console.error('Delete client error:', error);
        throw error;
      }
      
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
      }));
    } catch (error) {
      console.error('Error in deleteClient:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));