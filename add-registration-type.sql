-- Aggiunge il campo registration_type alla tabella profiles
-- Da eseguire manualmente su Supabase

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS registration_type varchar(20) DEFAULT 'free_trial';

-- I valori possibili sono:
-- 'free_trial' - Registrazione gratuita con 120 crediti (default)
-- 'onetime_payment' - Pagamento unico di €49 con 4000 crediti

-- Aggiorna la funzione can_purchase_recharge per includere gli utenti onetime_payment
CREATE OR REPLACE FUNCTION can_purchase_recharge(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = p_user_id 
    AND (
      registration_type = 'onetime_payment' 
      OR subscription_active = true 
      OR lifetime_active = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggiorna la funzione purchase_credit_recharge per permettere ricariche agli utenti onetime_payment
CREATE OR REPLACE FUNCTION purchase_credit_recharge(
  p_user_id UUID,
  p_amount INT,
  p_price_paid DECIMAL(10,2),
  p_description TEXT
) RETURNS JSON AS $$
DECLARE
  v_current_credits INT;
  v_can_recharge BOOLEAN;
  v_new_balance INT;
  v_transaction_id UUID;
BEGIN
  -- Verifica se l'utente può acquistare ricariche
  SELECT can_purchase_recharge(p_user_id) INTO v_can_recharge;
  
  IF NOT v_can_recharge THEN
    RETURN json_build_object(
      'success', false,
      'error', 'È necessario un abbonamento attivo (Mensile o Lifetime) o un account One-Time per acquistare ricariche crediti.'
    );
  END IF;
  
  -- Ottieni crediti attuali
  SELECT credits INTO v_current_credits
  FROM profiles 
  WHERE user_id = p_user_id;
  
  -- Calcola nuovo saldo
  v_new_balance := COALESCE(v_current_credits, 0) + p_amount;
  
  -- Aggiorna crediti
  UPDATE profiles 
  SET credits = v_new_balance,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Crea transazione
  INSERT INTO transactions (user_id, credits, operation, description)
  VALUES (p_user_id, p_amount, 'recharge', p_description)
  RETURNING id INTO v_transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'credits_added', p_amount,
    'transaction_id', v_transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;