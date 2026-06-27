import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Simplified Vote type - no candidate dependency
export interface Vote {
  id: string;
  is_approved: boolean;
  reason: string | null;
  custom_reason: string | null;
  comment_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
