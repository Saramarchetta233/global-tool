-- ========================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- ========================================
-- Aggiunge il sistema di abbonamenti SENZA modificare la logica esistente

-- 1. AGGIUNGI CAMPI SUBSCRIPTION ALLA TABELLA PROFILES ESISTENTE
-- ========================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'free' CHECK (subscription_type IN ('free', 'monthly', 'lifetime'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_monthly_credit_date timestamp with time zone DEFAULT NULL;

-- Indici per performance su nuovi campi
CREATE INDEX IF NOT EXISTS profiles_subscription_type_idx ON public.profiles(subscription_type);
CREATE INDEX IF NOT EXISTS profiles_subscription_end_date_idx ON public.profiles(subscription_end_date);

-- 2. TABELLA PER LOG TRANSAZIONI CREDITI
-- ========================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('signup_bonus', 'monthly_subscription', 'lifetime_purchase', 'credit_recharge', 'consumption')),
  amount integer NOT NULL, -- Positivo per aggiunte, negativo per consumi
  description text NOT NULL,
  subscription_type text DEFAULT NULL, -- Per tenere traccia del tipo di abbonamento
  created_at timestamp with time zone DEFAULT now()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS credit_transactions_type_idx ON public.credit_transactions(transaction_type);

-- RLS per credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere solo le proprie transazioni
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Solo il server può inserire transazioni (tramite supabaseAdmin)
CREATE POLICY "Service role can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true); -- Questa policy sarà usata solo con supabaseAdmin

-- 3. FUNZIONE PER ASSEGNARE CREDITI CON LOG
-- ========================================

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

-- 4. FUNZIONE PER AGGIORNARE SUBSCRIPTION STATUS
-- ========================================

CREATE OR REPLACE FUNCTION update_subscription(
  p_user_id uuid,
  p_subscription_type text,
  p_duration_months integer DEFAULT NULL -- NULL per lifetime
) RETURNS json AS $$
DECLARE
  v_start_date timestamp with time zone := now();
  v_end_date timestamp with time zone;
BEGIN
  -- Calcola end_date per monthly, NULL per lifetime
  IF p_subscription_type = 'monthly' THEN
    v_end_date := v_start_date + (p_duration_months || ' months')::interval;
  ELSIF p_subscription_type = 'lifetime' THEN
    v_end_date := NULL; -- Lifetime non scade mai
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

-- 5. FUNZIONE PER VERIFICARE SE RICARICHE SONO DISPONIBILI
-- ========================================

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
  
  -- Monthly: può ricaricare solo se abbonamento attivo (non scaduto)
  IF v_subscription_type = 'monthly' AND v_subscription_end_date > now() THEN
    RETURN true;
  END IF;
  
  -- Tutti gli altri casi: non può ricaricare
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;