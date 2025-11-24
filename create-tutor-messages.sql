-- Tabella per tracciare i messaggi del Tutor AI
-- Ogni riga = un messaggio inviato dall'utente al Tutor AI
-- Utilizzata per contare: primi 3 gratis, dal 4° in poi 2 crediti

CREATE TABLE IF NOT EXISTS public.tutor_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_content TEXT,
  response_content TEXT, -- risposta del tutor (opzionale)
  cost INTEGER DEFAULT 0, -- costo pagato per questo messaggio (0 = gratis, 2 = pagamento)
  was_free BOOLEAN DEFAULT FALSE, -- se il messaggio era gratuito o a pagamento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tutor_messages_user_id 
ON public.tutor_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_created_at 
ON public.tutor_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_user_created 
ON public.tutor_messages(user_id, created_at DESC);

-- RLS (Row Level Security) - solo l'utente può vedere i suoi messaggi
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tutor messages" ON public.tutor_messages;
DROP POLICY IF EXISTS "Users can insert their own tutor messages" ON public.tutor_messages;
DROP POLICY IF EXISTS "Users can update their own tutor messages" ON public.tutor_messages;

-- Create new policies
CREATE POLICY "Users can view their own tutor messages" 
ON public.tutor_messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tutor messages" 
ON public.tutor_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutor messages" 
ON public.tutor_messages FOR UPDATE 
USING (auth.uid() = user_id);

-- Commenti
COMMENT ON TABLE public.tutor_messages IS 'Messaggi del Tutor AI per tracciare primi 3 gratuiti vs successivi a 2 crediti';
COMMENT ON COLUMN public.tutor_messages.user_id IS 'ID dell''utente che ha inviato il messaggio';
COMMENT ON COLUMN public.tutor_messages.message_content IS 'Contenuto del messaggio inviato dall''utente';
COMMENT ON COLUMN public.tutor_messages.response_content IS 'Risposta del Tutor AI (opzionale)';
COMMENT ON COLUMN public.tutor_messages.cost IS 'Costo pagato per questo messaggio (0 = gratis, 2 = pagamento)';
COMMENT ON COLUMN public.tutor_messages.was_free IS 'Se il messaggio era gratuito o a pagamento';