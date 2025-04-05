declare global {
  interface Window {
    ENV: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      VITE_OPENAI_API_KEY: string;
    };
  }
}

export const getConfig = () => {
  return {
    supabaseUrl: window.ENV?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: window.ENV?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiApiKey: window.ENV?.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY
  };
}; 