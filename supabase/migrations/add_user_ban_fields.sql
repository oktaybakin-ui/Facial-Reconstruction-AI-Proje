-- Add ban fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_banned ON user_profiles(is_banned) WHERE is_banned = true;

