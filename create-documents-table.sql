-- Tabella per lo storico dei documenti caricati dagli utenti
-- Ogni riga = un documento caricato dall'utente
-- Collegata al profilo utente per sincronizzazione cross-device

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                    -- nome leggibile per lo storico
  original_filename TEXT NOT NULL,        -- nome file originale
  storage_path TEXT,                      -- path nel bucket Supabase Storage (opzionale)
  page_count INTEGER,                     -- numero di pagine del PDF
  file_size BIGINT,                       -- dimensione del file in bytes
  content_preview TEXT,                   -- preview del contenuto per ricerca
  document_hash TEXT,                     -- hash per evitare duplicati
  processing_status TEXT DEFAULT 'completed', -- completed, processing, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
ON public.documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_last_used 
ON public.documents(user_id, last_used_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_created 
ON public.documents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_hash 
ON public.documents(document_hash);

-- RLS (Row Level Security) - solo l'utente può vedere i suoi documenti
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

-- Create new policies
CREATE POLICY "Users can view their own documents" 
ON public.documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
ON public.documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_updated_at_trigger ON public.documents;
CREATE TRIGGER documents_updated_at_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Commenti
COMMENT ON TABLE public.documents IS 'Storico dei documenti caricati dagli utenti, sincronizzato cross-device';
COMMENT ON COLUMN public.documents.user_id IS 'ID dell''utente che ha caricato il documento';
COMMENT ON COLUMN public.documents.title IS 'Titolo leggibile del documento per lo storico';
COMMENT ON COLUMN public.documents.original_filename IS 'Nome file originale caricato dall''utente';
COMMENT ON COLUMN public.documents.storage_path IS 'Path nel bucket Supabase Storage (se utilizzato)';
COMMENT ON COLUMN public.documents.page_count IS 'Numero di pagine del PDF';
COMMENT ON COLUMN public.documents.content_preview IS 'Preview del contenuto per ricerca e anteprima';
COMMENT ON COLUMN public.documents.document_hash IS 'Hash del contenuto per evitare duplicati';
COMMENT ON COLUMN public.documents.processing_status IS 'Stato del processamento: completed, processing, failed';
COMMENT ON COLUMN public.documents.last_used_at IS 'Ultimo accesso al documento (per ordinamento)');