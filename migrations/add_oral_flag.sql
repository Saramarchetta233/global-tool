-- Add flag to track if user has used oral exam at least once
-- This ensures first oral exam is always free

-- Check if column exists first, then add if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'has_used_oral_once'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_used_oral_once BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add comment for clarity
COMMENT ON COLUMN profiles.has_used_oral_once IS 'Track if user has used oral exam feature at least once - first time is always free';