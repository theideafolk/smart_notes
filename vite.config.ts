import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@supabase/supabase-js',
            'openai'
          ]
        }
      }
    }
  },
  define: {
    // Prevent Vite from embedding these env vars in the build
    'import.meta.env.VITE_SUPABASE_URL': 'window.ENV?.VITE_SUPABASE_URL',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': 'window.ENV?.VITE_SUPABASE_ANON_KEY',
    'import.meta.env.VITE_OPENAI_API_KEY': 'window.ENV?.VITE_OPENAI_API_KEY'
  }
});
