-- Script per migrare utenti esistenti dalla tabella users alla tabella profiles
-- IMPORTANTE: Eseguire questo script DOPO aver creato la tabella profiles

-- 1. Migra utenti esistenti dalla tabella users alla tabella profiles
INSERT INTO public.profiles (user_id, credits, created_at, updated_at)
SELECT 
  id as user_id,
  GREATEST(credits, 120) as credits, -- Assicura almeno 120 crediti
  created_at,
  updated_at
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO UPDATE SET
  credits = GREATEST(EXCLUDED.credits, 120), -- Aggiorna a 120 se aveva meno
  updated_at = NOW();

-- 2. Aggiorna utenti con 0 crediti a 120
UPDATE public.profiles 
SET credits = 120, updated_at = NOW()
WHERE credits = 0;

-- 3. Verifica risultati
SELECT 
  COUNT(*) as total_profiles,
  AVG(credits) as avg_credits,
  MIN(credits) as min_credits,
  MAX(credits) as max_credits
FROM public.profiles;