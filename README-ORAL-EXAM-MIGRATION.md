# Oral Exam Sessions Migration

## Overview
This migration creates the `oral_exam_sessions` table to implement the simple session-counting logic for oral exam credits:
- First oral exam: FREE
- Subsequent exams: 25 credits each

## Prerequisites
You need the Supabase Service Role Key (not the anon key) to execute database migrations.

1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (NOT the anon key)
4. Add it to your `.env.local` file:

```bash
# Add this line to .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key_here
# Also add the URL if not present:
SUPABASE_URL=https://ldycfecwxhqcrqzaxkkz.supabase.co
```

## Running the Migration

```bash
# Install dependencies if needed
npm install

# Run the migration
node apply-oral-sessions-migration.js
```

## What the Migration Does

1. Creates `oral_exam_sessions` table with:
   - `id` (UUID, primary key)
   - `user_id` (UUID, references auth.users)
   - `session_data` (JSONB, stores exam details)
   - `completed` (boolean, tracks completion status)
   - `created_at` and `updated_at` timestamps

2. Sets up Row Level Security (RLS) policies so users only see their own sessions

3. Creates indexes for performance

## Testing After Migration

1. First oral exam should be FREE (0 credits)
2. Second oral exam should cost 25 credits  
3. Third and subsequent exams should also cost 25 credits

## Rollback (if needed)
```sql
DROP TABLE IF EXISTS public.oral_exam_sessions;
```