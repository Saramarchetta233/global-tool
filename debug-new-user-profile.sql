-- Debug del profilo del nuovo utente
-- Sostituisci USER_ID con l'ID del tuo utente di test

-- Controlla se il profilo esiste e ha i campi corretti
SELECT 
  user_id,
  credits,
  oral_exam_uses,
  probable_questions_uses,
  created_at,
  updated_at
FROM profiles
WHERE user_id = '4ae0d534-a327-41ae-872d-e3e30bf0f3a5';  -- Sostituisci con il tuo user_id

-- Controlla se ci sono sessioni di esame orale per questo utente
SELECT 
  COUNT(*) as oral_sessions_count
FROM oral_exam_sessions
WHERE user_id = '4ae0d534-a327-41ae-872d-e3e30bf0f3a5';

-- Controlla se ci sono sessioni di domande probabili
SELECT 
  COUNT(*) as probable_sessions_count
FROM probable_question_sessions
WHERE user_id = '4ae0d534-a327-41ae-872d-e3e30bf0f3a5';

-- Mostra le ultime sessioni di esame orale create
SELECT 
  id,
  user_id,
  created_at,
  session_data->>'cost' as cost,
  session_data->>'was_free' as was_free
FROM oral_exam_sessions
WHERE user_id = '4ae0d534-a327-41ae-872d-e3e30bf0f3a5'
ORDER BY created_at DESC;