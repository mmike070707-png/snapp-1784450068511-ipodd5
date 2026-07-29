import { createClient } from '@supabase/supabase-js';

// This automatically reads the keys that Vercel injected into your .env file.
// It checks the standard prefixes for React, Next.js, and Vite just to be safe.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase keys are missing. Make sure Vercel environment variables are properly set and pulled.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
