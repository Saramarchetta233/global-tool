-- Crea la tabella tutor_sessions completa per lo storico dei documenti

CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,                    -- nome file originale del PDF
  title TEXT,                        -- titolo leggibile per lo storico
  pdf_text TEXT,                     -- testo estratto dal PDF
  page_count INTEGER,                -- numero di pagine del PDF
  file_size BIGINT,                  -- dimensione del file in bytes
  riassunto_breve TEXT,              -- riassunto breve generato
  riassunto_esteso TEXT,             -- riassunto esteso generato
  mappa_concettuale JSONB,           -- mappa concettuale generata
  flashcard JSONB,                   -- flashcard generate
  quiz JSONB,                        -- quiz generato
  guida_esame TEXT,                  -- guida per l'esame generata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id 
ON public.tutor_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_last_used 
ON public.tutor_sessions(user_id, last_used_at DESC);

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_created 
ON public.tutor_sessions(user_id, created_at DESC);

-- RLS (Row Level Security) - solo l'utente può vedere le sue sessioni
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tutor sessions" ON public.tutor_sessions;
DROP POLICY IF EXISTS "Users can insert their own tutor sessions" ON public.tutor_sessions;
DROP POLICY IF EXISTS "Users can update their own tutor sessions" ON public.tutor_sessions;
DROP POLICY IF EXISTS "Users can delete their own tutor sessions" ON public.tutor_sessions;

-- Create new policies
CREATE POLICY "Users can view their own tutor sessions" 
ON public.tutor_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tutor sessions" 
ON public.tutor_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutor sessions" 
ON public.tutor_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tutor sessions" 
ON public.tutor_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_tutor_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tutor_sessions_updated_at_trigger ON public.tutor_sessions;
CREATE TRIGGER tutor_sessions_updated_at_trigger
  BEFORE UPDATE ON public.tutor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_sessions_updated_at();

-- Commenti sulla tabella e colonne
COMMENT ON TABLE public.tutor_sessions IS 'Storico dei documenti caricati e processati dagli utenti, con materiali di studio generati';
COMMENT ON COLUMN public.tutor_sessions.user_id IS 'ID dell''utente che ha caricato il documento';
COMMENT ON COLUMN public.tutor_sessions.file_name IS 'Nome file originale del PDF caricato';
COMMENT ON COLUMN public.tutor_sessions.title IS 'Titolo leggibile per lo storico (derivato da file_name)';
COMMENT ON COLUMN public.tutor_sessions.pdf_text IS 'Testo estratto dal PDF per il tutor AI';
COMMENT ON COLUMN public.tutor_sessions.page_count IS 'Numero di pagine del PDF';
COMMENT ON COLUMN public.tutor_sessions.file_size IS 'Dimensione del file in bytes';
COMMENT ON COLUMN public.tutor_sessions.riassunto_breve IS 'Riassunto breve generato dall''AI';
COMMENT ON COLUMN public.tutor_sessions.riassunto_esteso IS 'Riassunto esteso generato dall''AI';
COMMENT ON COLUMN public.tutor_sessions.mappa_concettuale IS 'Mappa concettuale generata dall''AI';
COMMENT ON COLUMN public.tutor_sessions.flashcard IS 'Flashcard generate dall''AI';
COMMENT ON COLUMN public.tutor_sessions.quiz IS 'Quiz generato dall''AI';
COMMENT ON COLUMN public.tutor_sessions.guida_esame IS 'Guida per l''esame generata dall''AI';
COMMENT ON COLUMN public.tutor_sessions.last_used_at IS 'Ultimo accesso al documento (per ordinamento nello storico)';