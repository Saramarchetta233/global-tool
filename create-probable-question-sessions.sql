-- Tabella per tracciare le sessioni di "Domande più Probabili all'Esame"
-- Ogni riga = una generazione di domande probabili per utente

CREATE TABLE IF NOT EXISTS public.probable_question_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID, -- opzionale, per reference al documento
  session_data JSONB, -- dati della sessione (questions, metadata, ecc.)
  cost INTEGER DEFAULT 0, -- costo pagato per questa generazione
  was_free BOOLEAN DEFAULT FALSE, -- se era gratis o a pagamento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_probable_question_sessions_user_id 
ON public.probable_question_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_probable_question_sessions_created_at 
ON public.probable_question_sessions(created_at);

-- RLS (Row Level Security) - solo l'utente può vedere le sue sessioni
ALTER TABLE public.probable_question_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own probable question sessions" ON public.probable_question_sessions;
DROP POLICY IF EXISTS "Users can insert their own probable question sessions" ON public.probable_question_sessions;
DROP POLICY IF EXISTS "Users can update their own probable question sessions" ON public.probable_question_sessions;

-- Create new policies
CREATE POLICY "Users can view their own probable question sessions" 
ON public.probable_question_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own probable question sessions" 
ON public.probable_question_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own probable question sessions" 
ON public.probable_question_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Commenti
COMMENT ON TABLE public.probable_question_sessions IS 'Sessioni di Domande Probabili per tracciare primo gratuito vs successivi a 5 crediti';
COMMENT ON COLUMN public.probable_question_sessions.user_id IS 'ID dell''utente che ha generato le domande probabili';
COMMENT ON COLUMN public.probable_question_sessions.document_id IS 'ID del documento per reference (opzionale)';
COMMENT ON COLUMN public.probable_question_sessions.session_data IS 'Dati della sessione: domande generate, metadata, ecc.';
COMMENT ON COLUMN public.probable_question_sessions.cost IS 'Costo pagato per questa generazione (0 = gratis, 5 = pagamento)';
COMMENT ON COLUMN public.probable_question_sessions.was_free IS 'Se la generazione era gratuita o a pagamento';