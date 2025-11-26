-- Script per aggiungere ENTRAMBI i flag per tracking primo utilizzo gratuito
-- Data: 2025-11-25
-- Regole: 
--   - Primo esame orale gratis, successivi 25 crediti
--   - Prima domanda probabile gratis, successive 5 crediti

-- 1. Aggiungi la colonna oral_exam_uses se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'oral_exam_uses'
  ) THEN
    ALTER TABLE profiles ADD COLUMN oral_exam_uses INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Colonna oral_exam_uses aggiunta alla tabella profiles';
  ELSE
    RAISE NOTICE 'Colonna oral_exam_uses esiste già';
  END IF;
END
$$;

-- 2. Aggiungi la colonna probable_questions_uses se non esiste
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

-- 3. Migra eventuali dati esistenti (se has_used_oral_once esiste)
DO $$
BEGIN
  -- Controlla se esiste la vecchia colonna has_used_oral_once
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'has_used_oral_once'
  ) THEN
    -- Migra i dati dalla vecchia colonna
    UPDATE profiles 
    SET oral_exam_uses = CASE 
      WHEN has_used_oral_once = true THEN 1 
      ELSE 0 
    END
    WHERE oral_exam_uses = 0;
    
    RAISE NOTICE 'Dati migrati da has_used_oral_once a oral_exam_uses';
  END IF;
END
$$;

-- 4. Aggiungi commenti per chiarezza
COMMENT ON COLUMN profiles.oral_exam_uses IS 'Contatore utilizzi esame orale: 0 = prossimo gratis, 1+ = prossimi costano 25 crediti';
COMMENT ON COLUMN profiles.probable_questions_uses IS 'Contatore utilizzi domande probabili: 0 = prossimo gratis, 1+ = prossimi costano 5 crediti';

-- 5. Verifica che tutto sia a posto (prima controlla quali colonne esistono)
SELECT 
  user_id,
  credits,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'oral_exam_uses'
  ) THEN oral_exam_uses ELSE -1 END as oral_exam_uses,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'probable_questions_uses'
  ) THEN probable_questions_uses ELSE -1 END as probable_questions_uses,
  created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;