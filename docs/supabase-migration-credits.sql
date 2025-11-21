-- Migration per aggiungere il sistema crediti a Supabase
-- Eseguire queste query nell'SQL editor di Supabase

-- 1. Creare tabella profiles se non esiste (collegata agli utenti auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 120 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Abilitare RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy per permettere agli utenti di leggere/aggiornare solo i propri dati
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Function per creare automaticamente il profilo alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 120);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger per eseguire la function alla registrazione
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Creare tabella log dei crediti per tracciabilità
CREATE TABLE IF NOT EXISTS public.credit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  operation TEXT NOT NULL, -- 'consume', 'add', 'purchase', 'bonus'
  amount INTEGER NOT NULL, -- positivo per aggiunta, negativo per consumo
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  feature_type TEXT, -- 'pdf', 'quiz', 'tutor', 'oral', 'download', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit logs" ON public.credit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Function per consumare crediti con log automatico
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
  -- Controlla crediti attuali
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = p_user_id;

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

  -- Aggiorna crediti
  UPDATE public.profiles
  SET credits = new_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log dell'operazione
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

-- 8. Function per aggiungere crediti con log automatico
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
  -- Prendi crediti attuali
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = p_user_id;

  -- Calcola nuovi crediti
  new_credits := current_credits + p_amount;

  -- Aggiorna crediti
  UPDATE public.profiles
  SET credits = new_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log dell'operazione
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