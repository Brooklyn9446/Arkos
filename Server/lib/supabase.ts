import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || ''; // Use service role for backend admin access


if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Ensure they are set in .env');
}

// We use the service role key to bypass RLS in our backend worker/routes,
// just like Prisma had root access.
export const supabase = createClient(supabaseUrl, supabaseKey);
