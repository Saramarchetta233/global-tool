-- Verifica le policy RLS sulle tabelle delle sessioni
-- Esegui questo script per vedere se ci sono problemi di permessi

-- 1. Controlla le policy sulla tabella oral_exam_sessions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'oral_exam_sessions';

-- 2. Controlla le policy sulla tabella probable_question_sessions  
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'probable_question_sessions';

-- 3. Verifica se RLS è abilitato su queste tabelle
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('oral_exam_sessions', 'probable_question_sessions');

-- 4. Test diretto: prova a contare le sessioni per l'utente specifico
-- Sostituisci USER_ID con l'ID reale dell'utente
SELECT 
  'oral_exam_sessions' as table_name,
  COUNT(*) as session_count
FROM oral_exam_sessions
WHERE user_id = '4ae0d534-a327-41ae-872d-e3e30bf0f3a5'

UNION ALL

SELECT 
  'probable_question_sessions' as table_name,
  COUNT(*) as session_count  
FROM probable_question_sessions
WHERE user_id = '4ae0d534-a327-41ae-872d-e3e30bf0f3a5';