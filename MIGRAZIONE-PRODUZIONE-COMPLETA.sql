-- ========================================
-- MIGRAZIONE COMPLETA PER PRODUZIONE
-- ========================================
-- Questo SQL allinea la produzione al localhost senza rompere niente

-- 1. TABELLA TUTOR_SESSIONS (per storico documenti cross-browser)
-- ========================================

CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  file_name text,
  title text,
  pdf_text text,
  page_count integer,
  file_size bigint,
  riassunto_breve text,
  riassunto_esteso text,
  mappa_concettuale jsonb,
  flashcard jsonb,
  quiz jsonb,
  guida_esame text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id ON public.tutor_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_created_at ON public.tutor_sessions (created_at);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_last_used ON public.tutor_sessions (last_used_at);

-- RLS per sicurezza
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own sessions" ON public.tutor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own sessions" ON public.tutor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own sessions" ON public.tutor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own sessions" ON public.tutor_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 2. TABELLA ORAL_EXAM_SESSIONS (per tracking esami orali - primo gratis)
-- ========================================

CREATE TABLE IF NOT EXISTS public.oral_exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_cost integer NOT NULL DEFAULT 25,
  was_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_oral_exam_sessions_user_id ON public.oral_exam_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_oral_exam_sessions_created_at ON public.oral_exam_sessions (created_at);

-- RLS
ALTER TABLE public.oral_exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own oral exam sessions" ON public.oral_exam_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own oral exam sessions" ON public.oral_exam_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. TABELLA PROBABLE_QUESTION_SESSIONS (per tracking domande probabili - primo gratis)
-- ========================================

CREATE TABLE IF NOT EXISTS public.probable_question_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_cost integer NOT NULL DEFAULT 5,
  was_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_probable_question_sessions_user_id ON public.probable_question_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_probable_question_sessions_created_at ON public.probable_question_sessions (created_at);

-- RLS
ALTER TABLE public.probable_question_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own probable question sessions" ON public.probable_question_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own probable question sessions" ON public.probable_question_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. TABELLA TUTOR_CHAT_MESSAGES (per chat persistente per documento)
-- ========================================

CREATE TABLE IF NOT EXISTS public.tutor_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  document_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_tutor_chat_messages_user_document ON public.tutor_chat_messages (user_id, document_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tutor_chat_messages_created_at ON public.tutor_chat_messages (created_at);

-- RLS
ALTER TABLE public.tutor_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own chat messages" ON public.tutor_chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own chat messages" ON public.tutor_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own chat messages" ON public.tutor_chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own chat messages" ON public.tutor_chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- 5. SISTEMA SUBSCRIPTION E CREDITI (se non già fatto)
-- ========================================

-- Aggiungi campi subscription a profiles se non esistono
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'free' CHECK (subscription_type IN ('free', 'monthly', 'lifetime'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_monthly_credit_date timestamp with time zone DEFAULT NULL;

-- Indici per performance su subscription
CREATE INDEX IF NOT EXISTS profiles_subscription_type_idx ON public.profiles(subscription_type);
CREATE INDEX IF NOT EXISTS profiles_subscription_end_date_idx ON public.profiles(subscription_end_date);

-- Tabella transazioni crediti
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('signup_bonus', 'monthly_subscription', 'lifetime_purchase', 'credit_recharge', 'consumption')),
  amount integer NOT NULL, -- Positivo per aggiunte, negativo per consumi
  description text NOT NULL,
  subscription_type text DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indici credit_transactions
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS credit_transactions_type_idx ON public.credit_transactions(transaction_type);

-- RLS credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true);

-- 6. FUNZIONI SQL PER CREDITI E SUBSCRIPTION
-- ========================================

-- Funzione per assegnare crediti con log
CREATE OR REPLACE FUNCTION assign_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text,
  p_subscription_type text DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Aggiorna i crediti dell'utente
  UPDATE public.profiles 
  SET 
    credits = credits + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  -- Se l'utente non esiste, restituisci errore
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Log della transazione
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    subscription_type
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount,
    p_description,
    p_subscription_type
  ) RETURNING id INTO v_transaction_id;
  
  -- Restituisci il risultato
  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per aggiornare subscription
CREATE OR REPLACE FUNCTION update_subscription(
  p_user_id uuid,
  p_subscription_type text,
  p_duration_months integer DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_start_date timestamp with time zone := now();
  v_end_date timestamp with time zone;
BEGIN
  -- Calcola end_date
  IF p_subscription_type = 'monthly' THEN
    v_end_date := v_start_date + (p_duration_months || ' months')::interval;
  ELSIF p_subscription_type = 'lifetime' THEN
    v_end_date := NULL;
  ELSE
    v_end_date := NULL;
  END IF;
  
  -- Aggiorna il profilo utente
  UPDATE public.profiles 
  SET 
    subscription_type = p_subscription_type,
    subscription_start_date = v_start_date,
    subscription_end_date = v_end_date,
    last_monthly_credit_date = CASE 
      WHEN p_subscription_type = 'monthly' THEN v_start_date 
      ELSE last_monthly_credit_date 
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Controlla se l'aggiornamento è andato a buon fine
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'subscription_type', p_subscription_type,
    'start_date', v_start_date,
    'end_date', v_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per verificare se può acquistare ricariche
CREATE OR REPLACE FUNCTION can_purchase_recharge(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_subscription_type text;
  v_subscription_end_date timestamp with time zone;
BEGIN
  SELECT subscription_type, subscription_end_date 
  INTO v_subscription_type, v_subscription_end_date
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  -- Se utente non trovato, non può ricaricare
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Lifetime: può sempre ricaricare
  IF v_subscription_type = 'lifetime' THEN
    RETURN true;
  END IF;
  
  -- Monthly: può ricaricare solo se abbonamento attivo
  IF v_subscription_type = 'monthly' AND v_subscription_end_date > now() THEN
    RETURN true;
  END IF;
  
  -- Tutti gli altri casi: non può ricaricare
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FINE MIGRAZIONE
-- ========================================
-- Questo SQL deve essere eseguito TUTTO insieme in Supabase produzione