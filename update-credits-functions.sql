-- Aggiorna le funzioni di crediti per usare la tabella profiles invece di users

-- Function per consumare crediti con log automatico (aggiornata)
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_feature_type TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Controlla crediti attuali dalla tabella profiles
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Se il profilo non esiste
  IF current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'profile_not_found',
      'current_credits', 0
    );
  END IF;

  -- Verifica se ha abbastanza crediti
  IF current_credits < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'current_credits', current_credits,
      'required', p_amount
    );
  END IF;

  -- Calcola nuovi crediti
  new_credits := current_credits - p_amount;

  -- Aggiorna crediti nella tabella profiles
  UPDATE public.profiles
  SET credits = new_credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log dell'operazione nella tabella credit_logs
  INSERT INTO public.credit_logs (
    user_id, operation, amount, balance_before, balance_after, description, feature_type
  ) VALUES (
    p_user_id, 'consume', -p_amount, current_credits, new_credits, p_description, p_feature_type
  );

  RETURN json_build_object(
    'success', true,
    'credits_consumed', p_amount,
    'new_balance', new_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function per aggiungere crediti con log automatico (aggiornata)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_operation TEXT DEFAULT 'add'
)
RETURNS JSON AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Prendi crediti attuali dalla tabella profiles
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Se il profilo non esiste, crealo con 120 crediti base
  IF current_credits IS NULL THEN
    INSERT INTO public.profiles (user_id, credits, created_at, updated_at)
    VALUES (p_user_id, 120, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    current_credits := 120;
  END IF;

  -- Calcola nuovi crediti
  new_credits := current_credits + p_amount;

  -- Aggiorna crediti nella tabella profiles
  UPDATE public.profiles
  SET credits = new_credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log dell'operazione nella tabella credit_logs
  INSERT INTO public.credit_logs (
    user_id, operation, amount, balance_before, balance_after, description
  ) VALUES (
    p_user_id, p_operation, p_amount, current_credits, new_credits, p_description
  );

  RETURN json_build_object(
    'success', true,
    'credits_added', p_amount,
    'new_balance', new_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;