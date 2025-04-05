import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In development, we can use empty values
const isDev = process.env.NODE_ENV === 'development';

const config = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || ''
};

const configJson = `window.ENV = ${JSON.stringify(config, null, 2)};`;

// Write to public directory
writeFileSync(resolve(__dirname, '../public/config.js'), configJson);

// Write to dist directory if it exists
const distDir = resolve(__dirname, '../dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}
writeFileSync(resolve(distDir, 'config.js'), configJson); 