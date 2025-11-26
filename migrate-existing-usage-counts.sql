-- Script per migrare i conteggi esistenti dalle tabelle sessioni ai flag nel profilo
-- Data: 2025-11-25
-- Questo script conta le sessioni esistenti e aggiorna i flag nei profili

-- 1. Aggiorna oral_exam_uses basandosi sulle sessioni esistenti
UPDATE profiles p
SET oral_exam_uses = (
  SELECT COUNT(*)
  FROM oral_exam_sessions oes
  WHERE oes.user_id = p.user_id
)
WHERE EXISTS (
  SELECT 1 
  FROM oral_exam_sessions oes
  WHERE oes.user_id = p.user_id
);

-- Mostra quanti profili sono stati aggiornati per esami orali
DO $$
DECLARE
  updated_oral_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_oral_count = ROW_COUNT;
  RAISE NOTICE 'Aggiornati % profili con conteggi esami orali', updated_oral_count;
END $$;

-- 2. Aggiorna probable_questions_uses basandosi sulle sessioni esistenti
UPDATE profiles p
SET probable_questions_uses = (
  SELECT COUNT(*)
  FROM probable_question_sessions pqs
  WHERE pqs.user_id = p.user_id
)
WHERE EXISTS (
  SELECT 1 
  FROM probable_question_sessions pqs
  WHERE pqs.user_id = p.user_id
);

-- Mostra quanti profili sono stati aggiornati per domande probabili
DO $$
DECLARE
  updated_probable_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_probable_count = ROW_COUNT;
  RAISE NOTICE 'Aggiornati % profili con conteggi domande probabili', updated_probable_count;
END $$;

-- 3. Verifica i risultati della migrazione
-- Mostra utenti che hanno usato i servizi
SELECT 
  p.user_id,
  p.credits,
  p.oral_exam_uses,
  p.probable_questions_uses,
  (SELECT COUNT(*) FROM oral_exam_sessions oes WHERE oes.user_id = p.user_id) as actual_oral_sessions,
  (SELECT COUNT(*) FROM probable_question_sessions pqs WHERE pqs.user_id = p.user_id) as actual_probable_sessions,
  p.created_at
FROM profiles p
WHERE p.oral_exam_uses > 0 OR p.probable_questions_uses > 0
ORDER BY p.created_at DESC
LIMIT 10;

-- 4. Mostra anche alcuni profili che NON hanno mai usato i servizi per confronto
SELECT 
  'Profili che non hanno mai usato i servizi:' as info;

SELECT 
  p.user_id,
  p.credits,
  p.oral_exam_uses,
  p.probable_questions_uses,
  p.created_at
FROM profiles p
WHERE p.oral_exam_uses = 0 AND p.probable_questions_uses = 0
ORDER BY p.created_at DESC
LIMIT 5;