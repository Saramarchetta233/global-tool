import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Verify configuration at runtime
if (typeof window !== 'undefined') {
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('dummy')) {
    console.error('❌ SUPABASE_URL not configured correctly:', supabaseUrl);
  }
  if (!supabaseKey || supabaseKey.includes('placeholder') || supabaseKey.includes('dummy')) {
    console.error('❌ SUPABASE_ANON_KEY not configured correctly');
  }
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder') && !supabaseKey.includes('dummy')) {
    console.log('✅ Supabase configured correctly');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client with service role key (bypasses RLS)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Database types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface CreditLog {
  id: string;
  user_id: string;
  type: 'summary' | 'flashcard' | 'quiz' | 'tutor' | 'map' | 'extraction';
  credits_used: number;
  timestamp: string;
}

export interface TutorSession {
  id: string;
  user_id: string;
  pdf_text: string;
  riassunto_breve: string;
  riassunto_esteso: string;
  flashcard: any[];
  created_at: string;
}

export interface StudyHistory {
  id: string;
  user_id: string;
  doc_context_id: string;
  doc_name: string;
  doc_title: string;
  summary_short: string;
  summary_extended: string;
  concept_map: any[];
  flashcards: any[];
  quiz_data: any[];
  tutor_messages: any[];
  study_in_one_hour: any;
  study_plan: any;
  probable_questions: any[];
  oral_exam_history: any[];
  target_language: string;
  created_at: string;
  updated_at: string;
}