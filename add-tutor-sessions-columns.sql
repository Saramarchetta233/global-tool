-- Aggiunge nuovi campi alla tabella tutor_sessions esistente per migliorare lo storico

-- Aggiungi colonne mancanti se non esistono
ALTER TABLE public.tutor_sessions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS mappa_concettuale JSONB,
ADD COLUMN IF NOT EXISTS quiz JSONB,
ADD COLUMN IF NOT EXISTS guida_esame TEXT;

-- Aggiorna last_used_at per i record esistenti che non lo hanno
UPDATE public.tutor_sessions 
SET last_used_at = created_at 
WHERE last_used_at IS NULL;

-- Imposta title basato su file_name per i record esistenti
UPDATE public.tutor_sessions 
SET title = COALESCE(
  regexp_replace(file_name, '\.pdf$', '', 'i'),
  'Documento'
)
WHERE title IS NULL AND file_name IS NOT NULL;

-- Imposta title generico per record senza file_name
UPDATE public.tutor_sessions 
SET title = 'Documento ' || EXTRACT(DAY FROM created_at) || '/' || EXTRACT(MONTH FROM created_at)
WHERE title IS NULL;

-- Crea indice per performance su last_used_at
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_last_used 
ON public.tutor_sessions(user_id, last_used_at DESC);

-- Commenti sui nuovi campi
COMMENT ON COLUMN public.tutor_sessions.file_name IS 'Nome file originale del PDF caricato';
COMMENT ON COLUMN public.tutor_sessions.title IS 'Titolo leggibile per lo storico (derivato da file_name)';
COMMENT ON COLUMN public.tutor_sessions.page_count IS 'Numero di pagine del PDF';
COMMENT ON COLUMN public.tutor_sessions.file_size IS 'Dimensione del file in bytes';
COMMENT ON COLUMN public.tutor_sessions.last_used_at IS 'Ultimo accesso al documento (per ordinamento)';
COMMENT ON COLUMN public.tutor_sessions.mappa_concettuale IS 'Dati della mappa concettuale generata';
COMMENT ON COLUMN public.tutor_sessions.quiz IS 'Dati del quiz generato';
COMMENT ON COLUMN public.tutor_sessions.guida_esame IS 'Guida per l''esame generata';