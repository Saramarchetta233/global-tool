-- Funzione per gestire atomicamente i crediti dell'esame orale
-- Regola: primo gratis, successivi 25 crediti

CREATE OR REPLACE FUNCTION public.handle_oral_exam_credits(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  current_credits INTEGER;
  current_oral_uses INTEGER;
  new_credits INTEGER;
  cost INTEGER;
  is_first_time BOOLEAN;
BEGIN
  -- Lock del profilo per atomicità
  SELECT credits, COALESCE(oral_exam_uses, 0)
  INTO current_credits, current_oral_uses
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Se il profilo non esiste
  IF current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'profile_not_found'
    );
  END IF;

  -- Determina se è la prima volta
  is_first_time := (current_oral_uses = 0);
  
  IF is_first_time THEN
    -- PRIMO ESAME: GRATIS
    cost := 0;
    new_credits := current_credits; -- nessuna variazione
    
    -- Incrementa il contatore (ora ha usato l'orale 1 volta)
    UPDATE public.profiles
    SET oral_exam_uses = 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log dell'operazione (prima volta gratis)
    INSERT INTO public.credit_logs (
      user_id, operation, amount, balance_before, balance_after, 
      description, feature_type
    ) VALUES (
      p_user_id, 'consume', 0, current_credits, new_credits, 
      'Primo esame orale (gratuito)', 'oral_exam'
    );
    
  ELSE
    -- ESAMI SUCCESSIVI: 25 CREDITI
    cost := 25;
    
    -- Verifica se ha abbastanza crediti
    IF current_credits < cost THEN
      RETURN json_build_object(
        'success', false,
        'error', 'insufficient_credits',
        'current_credits', current_credits,
        'required', cost
      );
    END IF;
    
    new_credits := current_credits - cost;
    
    -- Scala crediti e incrementa contatore atomicamente
    UPDATE public.profiles
    SET credits = new_credits,
        oral_exam_uses = oral_exam_uses + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log dell'operazione
    INSERT INTO public.credit_logs (
      user_id, operation, amount, balance_before, balance_after, 
      description, feature_type
    ) VALUES (
      p_user_id, 'consume', -cost, current_credits, new_credits, 
      'Esame orale', 'oral_exam'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'credits_consumed', cost,
    'new_balance', new_credits,
    'was_free', is_first_time,
    'oral_exam_count', current_oral_uses + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;