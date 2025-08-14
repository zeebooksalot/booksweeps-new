-- Add referring_url column to failed_login_attempts table
ALTER TABLE failed_login_attempts 
ADD COLUMN IF NOT EXISTS referring_url TEXT;
