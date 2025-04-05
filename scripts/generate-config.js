import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY
};

const configJson = `window.ENV = ${JSON.stringify(config, null, 2)}`;
writeFileSync(resolve(__dirname, '../public/config.js'), configJson); 