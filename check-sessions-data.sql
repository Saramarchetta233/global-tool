-- Script per verificare se esistono dati nelle tabelle sessioni
-- Data: 2025-11-25

-- 1. Verifica se le tabelle esistono e contengono dati
SELECT 'Checking oral_exam_sessions table:' as info;
SELECT COUNT(*) as total_oral_sessions FROM oral_exam_sessions;

SELECT 'Checking probable_question_sessions table:' as info;
SELECT COUNT(*) as total_probable_sessions FROM probable_question_sessions;

-- 2. Mostra alcune sessioni di esame orale se esistono
SELECT 'Sample oral exam sessions:' as info;
SELECT 
  user_id,
  created_at,
  session_data->>'cost' as cost,
  session_data->>'was_free' as was_free
FROM oral_exam_sessions
ORDER BY created_at DESC
LIMIT 5;

-- 3. Mostra alcune sessioni di domande probabili se esistono
SELECT 'Sample probable question sessions:' as info;
SELECT 
  user_id,
  created_at,
  cost,
  was_free
FROM probable_question_sessions
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verifica quali utenti hanno sessioni
SELECT 'Users with sessions:' as info;
SELECT 
  p.user_id,
  p.credits,
  p.oral_exam_uses as current_oral_flag,
  p.probable_questions_uses as current_probable_flag,
  (SELECT COUNT(*) FROM oral_exam_sessions oes WHERE oes.user_id = p.user_id) as oral_sessions_count,
  (SELECT COUNT(*) FROM probable_question_sessions pqs WHERE pqs.user_id = p.user_id) as probable_sessions_count
FROM profiles p
WHERE EXISTS (
  SELECT 1 FROM oral_exam_sessions oes WHERE oes.user_id = p.user_id
) OR EXISTS (
  SELECT 1 FROM probable_question_sessions pqs WHERE pqs.user_id = p.user_id
)
LIMIT 10;

-- 5. Se non ci sono risultati sopra, controlliamo se le tabelle esistono
SELECT 'Checking if tables exist:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('oral_exam_sessions', 'probable_question_sessions');