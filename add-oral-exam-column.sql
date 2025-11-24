-- Script per aggiungere la colonna oral_exam_uses se non esiste
-- Esegui questo nel pannello di amministrazione di Supabase

-- 1. Aggiungi la colonna se non esiste già
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'oral_exam_uses'
  ) THEN
    ALTER TABLE profiles ADD COLUMN oral_exam_uses INTEGER DEFAULT 0;
    RAISE NOTICE 'Colonna oral_exam_uses aggiunta alla tabella profiles';
  ELSE
    RAISE NOTICE 'Colonna oral_exam_uses esiste già';
  END IF;
END
$$;

-- 2. Popola i dati esistenti se necessario
UPDATE profiles 
SET oral_exam_uses = CASE 
  WHEN has_used_oral_once = true THEN 1 
  ELSE 0 
END
WHERE oral_exam_uses IS NULL;

-- 3. Verifica che tutto sia a posto
SELECT user_id, has_used_oral_once, oral_exam_uses, credits 
FROM profiles 
LIMIT 5;