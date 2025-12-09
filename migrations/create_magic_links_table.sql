-- Migration: Create magic_links table for BeCoolPro integration
-- Author: StudiusAI System
-- Date: 2025-12-09

CREATE TABLE magic_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  credits_to_grant int NOT NULL DEFAULT 4000,
  plan_type text NOT NULL DEFAULT 'one_time',
  is_used boolean NOT NULL DEFAULT false,
  used_by_user_id uuid NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz NULL,
  expires_at timestamptz NOT NULL
);

-- Create index for performance on token lookup
CREATE INDEX idx_magic_links_token ON magic_links (token);

-- Create index for performance on email lookup
CREATE INDEX idx_magic_links_email ON magic_links (email);

-- Create index for performance on expiration cleanup
CREATE INDEX idx_magic_links_expires_at ON magic_links (expires_at);

-- Enable RLS: only service role can access this table
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- No public policies - table is accessible ONLY via supabaseAdmin (service role)
-- This ensures magic links are secure and can only be managed server-side

-- Add comment for documentation
COMMENT ON TABLE magic_links IS 'Magic links for BeCoolPro integration - secure server-side only access';
COMMENT ON COLUMN magic_links.token IS 'Secure random token for magic link (32 chars hex)';
COMMENT ON COLUMN magic_links.email IS 'Email address associated with the magic link';
COMMENT ON COLUMN magic_links.credits_to_grant IS 'Number of credits to grant when link is claimed';
COMMENT ON COLUMN magic_links.plan_type IS 'Plan type to assign (usually one_time for BeCoolPro)';
COMMENT ON COLUMN magic_links.is_used IS 'Whether the magic link has been used';
COMMENT ON COLUMN magic_links.used_by_user_id IS 'UUID of user who claimed the link';
COMMENT ON COLUMN magic_links.expires_at IS 'When the magic link expires (30 days from creation)';