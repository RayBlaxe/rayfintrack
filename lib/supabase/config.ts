// Centralized environment variables for Supabase and Gemini
// Secrets are read from .env.local (locally) or Vercel Environment Variables (production)

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
