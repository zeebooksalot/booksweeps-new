-- Add login_page_url column to failed_login_attempts table
ALTER TABLE failed_login_attempts 
ADD COLUMN IF NOT EXISTS login_page_url TEXT;
