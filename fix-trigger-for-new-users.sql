-- VERIFICA E RICREARE TRIGGER PER NUOVI UTENTI

-- 1. Prima elimina trigger esistente se c'è
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Ricrea function aggiornata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits)
  VALUES (NEW.id, NEW.email, 120)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ricrea trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Aggiungi policy per permettere inserimenti durante registrazione
CREATE POLICY "Users can insert own data during registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Verifica che il trigger sia stato creato
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';