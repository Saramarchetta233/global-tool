-- Quick fix per utenti esistenti con 0 crediti
-- Da eseguire immediatamente in Supabase SQL Editor

-- 1. Trova utenti auth che non hanno un profilo nella tabella profiles
-- e crea un profilo con 120 crediti
INSERT INTO public.profiles (user_id, credits, created_at, updated_at)
SELECT 
  u.id as user_id,
  120 as credits,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 2. Aggiorna tutti i profili con 0 crediti a 120
UPDATE public.profiles 
SET 
  credits = 120, 
  updated_at = NOW()
WHERE credits = 0 OR credits IS NULL;

-- 3. Verifica i risultati
SELECT 
  'Profiles with 0 credits' as description,
  COUNT(*) as count
FROM public.profiles 
WHERE credits = 0

UNION ALL

SELECT 
  'Total profiles' as description,
  COUNT(*) as count
FROM public.profiles

UNION ALL

SELECT 
  'Average credits' as description,
  ROUND(AVG(credits), 2) as count
FROM public.profiles;