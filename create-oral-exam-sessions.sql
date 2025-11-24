-- Tabella per tracciare le sessioni di esame orale
-- Ogni riga = una sessione di esame orale iniziata dall'utente

CREATE TABLE IF NOT EXISTS public.oral_exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_context_hash TEXT, -- hash del documento per evitare duplicati (opzionale)
  session_data JSONB, -- dati della sessione (messaggi, valutazioni, ecc.)
  completed BOOLEAN DEFAULT FALSE, -- se l'esame è stato completato
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_oral_exam_sessions_user_id 
ON public.oral_exam_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_oral_exam_sessions_created_at 
ON public.oral_exam_sessions(created_at);

-- RLS (Row Level Security) - solo l'utente può vedere le sue sessioni
ALTER TABLE public.oral_exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own oral exam sessions" 
ON public.oral_exam_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own oral exam sessions" 
ON public.oral_exam_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own oral exam sessions" 
ON public.oral_exam_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Commenti
COMMENT ON TABLE public.oral_exam_sessions IS 'Sessioni di esame orale per tracciare primo gratuito vs successivi a pagamento';
COMMENT ON COLUMN public.oral_exam_sessions.user_id IS 'ID dell''utente che ha iniziato l''esame orale';
COMMENT ON COLUMN public.oral_exam_sessions.document_context_hash IS 'Hash del documento per reference (opzionale)';
COMMENT ON COLUMN public.oral_exam_sessions.session_data IS 'Dati della sessione: messaggi, valutazioni, ecc.';
COMMENT ON COLUMN public.oral_exam_sessions.completed IS 'Se l''esame è stato completato o abbandonato';