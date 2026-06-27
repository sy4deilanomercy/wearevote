-- WeAreVote Database Setup - Simplified Version
-- Run this SQL in your Supabase SQL Editor

-- Drop existing tables if they exist (use with caution in production)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

-- Create simplified votes table (no candidate reference needed)
CREATE TABLE IF NOT EXISTS votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    is_approved boolean NOT NULL,
    reason text,
    custom_reason text,
    comment_status text DEFAULT 'pending' CHECK (comment_status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance (following Supabase best practices)
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_comment_status ON votes(comment_status) WHERE comment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_votes_approved ON votes(is_approved, comment_status) WHERE comment_status IN ('approved');

-- Enable Row Level Security (RLS) - Following Supabase security best practices
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes table
-- Allow everyone to insert votes (for voting)
CREATE POLICY "Allow public insert votes"
ON votes FOR INSERT
TO public
WITH CHECK (true);

-- Allow everyone to read approved votes (for statistics)
CREATE POLICY "Allow public read approved votes"
ON votes FOR SELECT
TO public
USING (comment_status = 'approved' OR is_approved = true);

-- Allow everyone to update votes (for admin moderation)
-- In production, you should restrict this to admin users only
CREATE POLICY "Allow public update votes"
ON votes FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public access to verify login (needed for the RPC function)
CREATE POLICY "Allow login verification"
ON admin_users FOR SELECT
TO public
USING (true);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', MD5('admin123'))
ON CONFLICT (username) DO NOTHING;

-- Create function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin_login(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE username = p_username 
    AND password_hash = MD5(p_password)
  );
END;
$$;

-- Enable Realtime for live updates
-- Run this in Supabase Dashboard > Database > Replication
-- Or run: ALTER PUBLICATION supabase_realtime ADD TABLE votes;
