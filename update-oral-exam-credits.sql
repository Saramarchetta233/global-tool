-- Migrazione per sistemare logica crediti esame orale
-- Data: 2025-11-24
-- Regola: primo esame orale gratis, successivi 25 crediti

-- 1. Sostituisco la colonna has_used_oral_once con oral_exam_uses (più flessibile)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS oral_exam_uses INTEGER NOT NULL DEFAULT 0;

-- 2. Migro i dati esistenti (se has_used_oral_once esiste)
-- Se ha usato l'orale una volta, imposto oral_exam_uses = 1
UPDATE profiles 
SET oral_exam_uses = 1 
WHERE has_used_oral_once = true;

-- 3. Rimuovo la vecchia colonna (opzionale, per pulizia)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS has_used_oral_once;

-- 4. Commento: oral_exam_uses significa:
-- 0 = mai usato esame orale (prossimo sarà gratis)
-- 1+ = ha già usato almeno una volta (prossimi costano 25 crediti)