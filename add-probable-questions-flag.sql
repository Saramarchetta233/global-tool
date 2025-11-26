-- Script per aggiungere flag per tracking primo utilizzo gratuito domande probabili
-- Data: 2025-11-25
-- Regola: primo tentativo domande probabili gratis, successivi 5 crediti

-- Aggiungi la colonna se non esiste già
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'probable_questions_uses'
  ) THEN
    ALTER TABLE profiles ADD COLUMN probable_questions_uses INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Colonna probable_questions_uses aggiunta alla tabella profiles';
  ELSE
    RAISE NOTICE 'Colonna probable_questions_uses esiste già';
  END IF;
END
$$;

-- Commento per chiarezza
COMMENT ON COLUMN profiles.probable_questions_uses IS 'Contatore utilizzi domande probabili: 0 = prossimo gratis, 1+ = prossimi costano 5 crediti';

-- Verifica che tutto sia a posto
SELECT user_id, oral_exam_uses, probable_questions_uses, credits, created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;