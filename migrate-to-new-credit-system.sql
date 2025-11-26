-- ========================================
-- MIGRAZIONE AL NUOVO SISTEMA CREDITI
-- ========================================
-- Aggiorna la struttura per seguire le specifiche finali

-- 1. AGGIUNGI CAMPI MANCANTI ALLA TABELLA PROFILES
-- ========================================

-- Aggiungi subscription_active (boolean)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false;

-- Aggiungi lifetime_active (boolean) 
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lifetime_active boolean DEFAULT false;

-- Aggiungi subscription_renewal_date (per monthly)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_renewal_date timestamp with time zone DEFAULT NULL;

-- 2. AGGIORNA CONSTRAINT SU SUBSCRIPTION_TYPE
-- ========================================

-- Rimuovi il constraint esistente se esiste e aggiungine uno nuovo
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_type_check 
CHECK (subscription_type IN ('monthly', 'lifetime') OR subscription_type IS NULL);

-- 3. MIGRA I DATI ESISTENTI ALLA NUOVA LOGICA
-- ========================================

-- Aggiorna subscription_active basato su subscription_type e date
UPDATE public.profiles 
SET subscription_active = CASE
  WHEN subscription_type = 'monthly' AND subscription_end_date > now() THEN true
  WHEN subscription_type = 'lifetime' THEN false -- lifetime_active gestisce questo
  ELSE false
END;

-- Aggiorna lifetime_active per utenti lifetime
UPDATE public.profiles 
SET lifetime_active = CASE
  WHEN subscription_type = 'lifetime' THEN true
  ELSE false
END;

-- Aggiorna subscription_renewal_date per utenti monthly attivi
UPDATE public.profiles 
SET subscription_renewal_date = subscription_end_date
WHERE subscription_type = 'monthly' AND subscription_active = true;

-- 4. INDICI PER PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS profiles_subscription_active_idx ON public.profiles(subscription_active);
CREATE INDEX IF NOT EXISTS profiles_lifetime_active_idx ON public.profiles(lifetime_active);
CREATE INDEX IF NOT EXISTS profiles_subscription_renewal_date_idx ON public.profiles(subscription_renewal_date);

-- 5. FUNZIONE AGGIORNATA PER VERIFICARE RICARICHE
-- ========================================

CREATE OR REPLACE FUNCTION can_purchase_recharge(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_subscription_active boolean;
  v_lifetime_active boolean;
BEGIN
  SELECT subscription_active, lifetime_active 
  INTO v_subscription_active, v_lifetime_active
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  -- Se utente non trovato, non può ricaricare
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Può ricaricare SOLO se ha abbonamento attivo O lifetime
  RETURN (v_subscription_active = true OR v_lifetime_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNZIONE PER ATTIVARE ABBONAMENTO MONTHLY
-- ========================================

CREATE OR REPLACE FUNCTION activate_monthly_subscription(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_renewal_date timestamp with time zone := now() + interval '1 month';
BEGIN
  -- Aggiorna il profilo per abbonamento monthly
  UPDATE public.profiles 
  SET 
    subscription_type = 'monthly',
    subscription_active = true,
    subscription_renewal_date = v_renewal_date,
    lifetime_active = false, -- Monthly esclude lifetime
    updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Aggiungi 2000 crediti per l'abbonamento monthly
  PERFORM assign_credits(
    p_user_id,
    2000,
    'monthly_subscription',
    'Crediti abbonamento mensile (2.000)',
    'monthly'
  );
  
  RETURN json_build_object(
    'success', true,
    'subscription_type', 'monthly',
    'renewal_date', v_renewal_date,
    'credits_added', 2000
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNZIONE PER ATTIVARE ABBONAMENTO LIFETIME
-- ========================================

CREATE OR REPLACE FUNCTION activate_lifetime_subscription(p_user_id uuid)
RETURNS json AS $$
BEGIN
  -- Aggiorna il profilo per abbonamento lifetime
  UPDATE public.profiles 
  SET 
    subscription_type = 'lifetime',
    subscription_active = false, -- Lifetime usa lifetime_active
    lifetime_active = true,
    subscription_renewal_date = NULL, -- Lifetime non ha scadenza
    updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Aggiungi 6000 crediti per l'abbonamento lifetime
  PERFORM assign_credits(
    p_user_id,
    6000,
    'lifetime_purchase',
    'Crediti abbonamento lifetime (6.000)',
    'lifetime'
  );
  
  RETURN json_build_object(
    'success', true,
    'subscription_type', 'lifetime',
    'lifetime_active', true,
    'credits_added', 6000
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNZIONE PER RICARICA CREDITI (CON PROTEZIONE)
-- ========================================

CREATE OR REPLACE FUNCTION purchase_credit_recharge(
  p_user_id uuid,
  p_amount integer,
  p_price_paid numeric,
  p_description text
) RETURNS json AS $$
DECLARE
  v_can_recharge boolean;
BEGIN
  -- Verifica se l'utente può ricaricare
  SELECT can_purchase_recharge(p_user_id) INTO v_can_recharge;
  
  IF NOT v_can_recharge THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ricariche disponibili solo con abbonamento attivo'
    );
  END IF;
  
  -- Procedi con la ricarica
  RETURN assign_credits(
    p_user_id,
    p_amount,
    'credit_recharge',
    p_description,
    NULL -- Le ricariche non sono legate a subscription_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. COMMENTI FINALI
-- ========================================
-- Questo script migra il sistema esistente alle nuove specifiche:
-- - subscription_active: true solo per monthly attivi
-- - lifetime_active: true solo per lifetime
-- - Ricariche protette: solo se subscription_active OR lifetime_active
-- - Funzioni per gestire acquisti monthly/lifetime/ricariche