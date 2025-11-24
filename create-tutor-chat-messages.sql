-- Tabella per persistere i messaggi della chat del tutor per documento
CREATE TABLE IF NOT EXISTS tutor_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  document_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tutor_chat_messages_user_document 
ON tutor_chat_messages (user_id, document_id, created_at);

CREATE INDEX IF NOT EXISTS idx_tutor_chat_messages_created_at 
ON tutor_chat_messages (created_at);

-- RLS: Abilita Row Level Security
ALTER TABLE tutor_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere solo i propri messaggi
CREATE POLICY tutor_chat_messages_select_own 
ON tutor_chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire solo messaggi con il proprio user_id
CREATE POLICY tutor_chat_messages_insert_own 
ON tutor_chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Gli utenti possono modificare solo i propri messaggi (opzionale)
CREATE POLICY tutor_chat_messages_update_own 
ON tutor_chat_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare solo i propri messaggi (opzionale)
CREATE POLICY tutor_chat_messages_delete_own 
ON tutor_chat_messages 
FOR DELETE 
USING (auth.uid() = user_id);