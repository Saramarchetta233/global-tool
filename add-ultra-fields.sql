-- Safe addition di colonne Ultra per flashcard e mappe
-- NON rompe nulla perché sono nullable e opzionali

ALTER TABLE tutor_sessions 
ADD COLUMN IF NOT EXISTS flashcard_ultra JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mappa_ultra JSONB DEFAULT NULL;

-- Indexes per performance (opzionali)
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_flashcard_ultra 
ON tutor_sessions USING GIN (flashcard_ultra) 
WHERE flashcard_ultra IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_mappa_ultra 
ON tutor_sessions USING GIN (mappa_ultra) 
WHERE mappa_ultra IS NOT NULL;

-- Verifica che le colonne esistano
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tutor_sessions' 
AND column_name IN ('flashcard_ultra', 'mappa_ultra');