-- Soluzione alternativa: crea una tabella separata per tracciare esami orali
CREATE TABLE IF NOT EXISTS oral_exam_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, document_hash)
);

-- Abilita RLS
ALTER TABLE oral_exam_tracking ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo i propri record
CREATE POLICY "Users can view own oral exam history" ON oral_exam_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own oral exam records" ON oral_exam_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indice per performance
CREATE INDEX IF NOT EXISTS oral_exam_tracking_user_id_idx ON oral_exam_tracking(user_id);
CREATE INDEX IF NOT EXISTS oral_exam_tracking_document_hash_idx ON oral_exam_tracking(document_hash);