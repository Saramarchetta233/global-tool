-- Migrazione per aggiungere campi per salvare il testo completo estratto
-- ATTENZIONE: Siamo in produzione con 50+ studenti attivi

-- 1. Aggiungi colonne per testo estratto e metadati
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS document_structure JSONB,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';

-- 2. Aggiungi indice GIN per ricerca full-text (opzionale ma utile)
CREATE INDEX IF NOT EXISTS idx_documents_extracted_text_search 
ON public.documents 
USING gin(to_tsvector('italian', extracted_text));

-- 3. Commenti per documentazione
COMMENT ON COLUMN public.documents.extracted_text IS 'Testo completo estratto dal PDF tramite LlamaParse';
COMMENT ON COLUMN public.documents.document_structure IS 'Struttura del documento (capitoli, sezioni, etc) in formato JSON';
COMMENT ON COLUMN public.documents.processing_metadata IS 'Metadati di elaborazione (stato riassunto ultra, progress, etc)';

-- 4. Verifica che le colonne siano state create
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'documents'
  AND column_name IN ('extracted_text', 'document_structure', 'processing_metadata')
ORDER BY ordinal_position;