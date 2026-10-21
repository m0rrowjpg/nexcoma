import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type ContentType = 'tool' | 'category' | 'article' | 'affiliate' | 'media';
export type ContentStatus = 'draft' | 'published';

export interface ContentItem {
  id: string;
  content_type: ContentType;
  slug: string;
  title: string;
  status: ContentStatus;
  data: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}
