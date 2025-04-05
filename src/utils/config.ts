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
  // Always prefer window.ENV values over import.meta.env
  const config = {
    supabaseUrl: window.ENV?.VITE_SUPABASE_URL || '',
    supabaseAnonKey: window.ENV?.VITE_SUPABASE_ANON_KEY || '',
    openaiApiKey: window.ENV?.VITE_OPENAI_API_KEY || ''
  };

  // Throw error if required values are missing
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Missing required environment variables');
  }

  return config;
}; 