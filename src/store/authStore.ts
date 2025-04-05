import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: any | null;
  userProfile: User | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, mobileNumber?: string, dateOfBirth?: string, avatar?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  
  setUser: (user) => {
    set({ user });
    
    // When the user changes, fetch the profile if we have a user
    if (user) {
      get().fetchUserProfile();
    } else {
      set({ userProfile: null });
    }
  },
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  
  signUp: async (email: string, password: string, firstName: string, lastName: string, mobileNumber?: string, dateOfBirth?: string, avatar?: string) => {
    try {
      // Check if user already exists to provide better error message
      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (existingUsers) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create the user profile using RPC function that handles RLS
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: email,
          user_first_name: firstName,
          user_last_name: lastName,
          user_mobile_number: mobileNumber || null,
          user_date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          user_avatar: avatar || 'profile.png'
        });
        
        if (profileError) {
          console.error('Failed to create user profile:', profileError);
          throw new Error('Account created but failed to set up profile. Please contact support.');
        }
      }
    } catch (error: any) {
      if (error.message?.includes('user_already_exists')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw error;
    }
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, userProfile: null });
  },
  
  updateUserProfile: async (updates) => {
    const { user } = get();
    
    if (!user) throw new Error('You must be logged in to update your profile');
    
    // Use RPC function to update profile that handles RLS
    const { error } = await supabase.rpc('update_user_profile', {
      user_id: user.id,
      first_name: updates.first_name || null,
      last_name: updates.last_name || null,
      mobile_number: updates.mobile_number || null,
      date_of_birth: updates.date_of_birth || null,
      avatar: updates.avatar || null
    });
      
    if (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
    
    // Refresh the profile
    await get().fetchUserProfile();
  },
  
  fetchUserProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      // Use RPC function to get user profile that handles RLS
      const { data, error } = await supabase.rpc('get_user_profile', {
        user_id: user.id
      });
        
      if (error) throw error;
      
      if (data) {
        set({ userProfile: data });
      } else {
        console.warn('No user profile found for user ID:', user.id);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },
}));