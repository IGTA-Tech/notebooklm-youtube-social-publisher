import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface ContentItem {
  id: string;
  title: string;
  video_path?: string;
  audio_path?: string;
  transcript?: string;
  thumbnail_url?: string;
  brand_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  website_url: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  tone?: string;
  keywords?: string[];
  created_at: string;
}

export interface Post {
  id: string;
  content_id: string;
  platforms: string[];
  post_text: string;
  status: 'pending' | 'published' | 'failed';
  published_at?: string;
  error_message?: string;
  created_at: string;
}
