-- Add needs_password_reset column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS needs_password_reset BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_needs_password_reset ON profiles(needs_password_reset) WHERE needs_password_reset = TRUE;