-- Tabella profiles per gestire i crediti utente
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 120,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index per performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- RLS (Row Level Security) se necessario
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di leggere/modificare solo il proprio profilo
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy per permettere inserimento durante registrazione
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);