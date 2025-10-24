import { createClient } from '@supabase/supabase-js';
import { Platform } from '@/types/platform';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Database {
  public: {
    Tables: {
      platforms: {
        Row: Platform;
        Insert: Omit<Platform, 'platform_id'> & { platform_id?: string };
        Update: Partial<Platform>;
      };
    };
  };
}
