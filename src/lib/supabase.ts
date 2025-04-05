import { createClient } from '@supabase/supabase-js';
import { getConfig } from '../utils/config';

const { supabaseUrl, supabaseAnonKey } = getConfig();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);