import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || ''
};

// Log environment variable status (without revealing values)
console.log('Environment variables status:');
console.log('VITE_SUPABASE_URL:', config.VITE_SUPABASE_URL ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', config.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('VITE_OPENAI_API_KEY:', config.VITE_OPENAI_API_KEY ? 'Set' : 'Not set');

const configJson = `window.ENV = ${JSON.stringify(config, null, 2)};`;

// Write to public directory
writeFileSync(resolve(__dirname, '../public/config.js'), configJson);

// Write to dist directory if it exists
const distDir = resolve(__dirname, '../dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}
writeFileSync(resolve(distDir, 'config.js'), configJson); 