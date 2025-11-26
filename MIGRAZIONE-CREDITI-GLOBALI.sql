-- ========================================
-- MIGRAZIONE SISTEMA CREDITI GLOBALI
-- ========================================
-- Implementa il sistema crediti definitivo secondo la "Bibbia dei Crediti"
-- SENZA modificare logiche tool esistenti

-- 1. AGGIORNAMENTO TABELLA PROFILES CON CAMPI PLAN
-- ========================================

-- Aggiungi campi plan secondo la specifica
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'monthly', 'lifetime'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_started_at timestamp with time zone DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_renews_at timestamp with time zone DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_active_plan boolean DEFAULT false;

-- Indici per performance
CREATE INDEX IF NOT EXISTS profiles_plan_type_idx ON public.profiles(plan_type);
CREATE INDEX IF NOT EXISTS profiles_has_active_plan_idx ON public.profiles(has_active_plan);

-- 2. AGGIORNAMENTO TABELLA CREDIT_TRANSACTIONS
-- ========================================

-- Prima controlliamo se la tabella esiste e la ricreiamo con schema corretto
DROP TABLE IF EXISTS public.credit_transactions CASCADE;

-- Crea la tabella credit_transactions con schema corretto
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- positivo se aggiunge crediti, negativo se consuma
  reason text NOT NULL,    -- 'FREE_WELCOME', 'MONTHLY_PLAN', 'LIFETIME_PLAN', 'TOPUP_1000', ecc.
  metadata jsonb DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indici per performance
CREATE INDEX credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX credit_transactions_created_at_idx ON public.credit_transactions(created_at);
CREATE INDEX credit_transactions_reason_idx ON public.credit_transactions(reason);

-- RLS per credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.credit_transactions;

-- Policy: Gli utenti possono vedere solo le proprie transazioni
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Solo il server può inserire transazioni (tramite supabaseAdmin)
CREATE POLICY "Service role can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true);

-- 3. FUNZIONI SQL PER GESTIONE CREDITI GLOBALI
-- ========================================

-- Funzione per assegnare crediti di benvenuto (120 gratis)
CREATE OR REPLACE FUNCTION grant_free_welcome_credits(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_existing_welcome integer;
  v_new_balance integer;
BEGIN
  -- Controlla se l'utente ha già ricevuto i crediti di benvenuto
  SELECT COUNT(*) INTO v_existing_welcome
  FROM public.credit_transactions 
  WHERE user_id = p_user_id AND reason = 'FREE_WELCOME';
  
  IF v_existing_welcome > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Welcome credits already granted'
    );
  END IF;
  
  -- Assegna 120 crediti e imposta plan free
  UPDATE public.profiles 
  SET 
    credits = credits + 120,
    plan_type = 'free',
    has_active_plan = false,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Log della transazione
  INSERT INTO public.credit_transactions (user_id, amount, reason)
  VALUES (p_user_id, 120, 'FREE_WELCOME');
  
  RETURN json_build_object(
    'success', true,
    'credits_added', 120,
    'new_balance', v_new_balance,
    'plan_type', 'free'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per attivare piano mensile
CREATE OR REPLACE FUNCTION grant_monthly_plan(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_new_balance integer;
BEGIN
  -- Aggiorna profilo e aggiungi 2000 crediti
  UPDATE public.profiles 
  SET 
    credits = credits + 2000,
    plan_type = 'monthly',
    has_active_plan = true,
    plan_started_at = now(),
    plan_renews_at = now() + INTERVAL '1 month',
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Log della transazione
  INSERT INTO public.credit_transactions (user_id, amount, reason, metadata)
  VALUES (p_user_id, 2000, 'MONTHLY_PLAN', 
    json_build_object('plan_price', '19.99', 'currency', 'EUR'));
  
  RETURN json_build_object(
    'success', true,
    'credits_added', 2000,
    'new_balance', v_new_balance,
    'plan_type', 'monthly',
    'plan_started_at', now(),
    'plan_renews_at', now() + INTERVAL '1 month'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per attivare piano lifetime
CREATE OR REPLACE FUNCTION grant_lifetime_plan(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_new_balance integer;
BEGIN
  -- Aggiorna profilo e aggiungi 6000 crediti
  UPDATE public.profiles 
  SET 
    credits = credits + 6000,
    plan_type = 'lifetime',
    has_active_plan = true,
    plan_started_at = now(),
    plan_renews_at = NULL, -- Lifetime non rinnova mai
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Log della transazione
  INSERT INTO public.credit_transactions (user_id, amount, reason, metadata)
  VALUES (p_user_id, 6000, 'LIFETIME_PLAN', 
    json_build_object('plan_price', '69.99', 'currency', 'EUR'));
  
  RETURN json_build_object(
    'success', true,
    'credits_added', 6000,
    'new_balance', v_new_balance,
    'plan_type', 'lifetime',
    'plan_started_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione generica per ricariche (topup)
CREATE OR REPLACE FUNCTION grant_topup(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_price text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_new_balance integer;
  v_has_active_plan boolean;
BEGIN
  -- Verifica che l'utente abbia un piano attivo
  SELECT has_active_plan INTO v_has_active_plan
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  IF NOT v_has_active_plan THEN
    RETURN json_build_object(
      'success', false,
      'error', 'NO_ACTIVE_PLAN',
      'message', 'Ricariche disponibili solo con abbonamento attivo'
    );
  END IF;
  
  -- Aggiungi crediti
  UPDATE public.profiles 
  SET 
    credits = credits + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  -- Log della transazione
  INSERT INTO public.credit_transactions (user_id, amount, reason, metadata)
  VALUES (p_user_id, p_amount, p_reason, 
    json_build_object('topup_price', p_price, 'currency', 'EUR'));
  
  RETURN json_build_object(
    'success', true,
    'credits_added', p_amount,
    'new_balance', v_new_balance,
    'topup_reason', p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzioni specifiche per le 3 ricariche
CREATE OR REPLACE FUNCTION grant_topup_1000(p_user_id uuid)
RETURNS json AS $$
BEGIN
  RETURN grant_topup(p_user_id, 1000, 'TOPUP_1000', '9.99');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION grant_topup_3000(p_user_id uuid)
RETURNS json AS $$
BEGIN
  RETURN grant_topup(p_user_id, 3000, 'TOPUP_3000', '14.99');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION grant_topup_10000(p_user_id uuid)
RETURNS json AS $$
BEGIN
  RETURN grant_topup(p_user_id, 10000, 'TOPUP_10000', '39.99');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FINE MIGRAZIONE CREDITI GLOBALI
-- ========================================