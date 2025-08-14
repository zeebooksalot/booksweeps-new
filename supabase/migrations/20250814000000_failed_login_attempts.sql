-- Create failed_login_attempts table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  success BOOLEAN DEFAULT FALSE NOT NULL,
  user_agent TEXT,
  reason TEXT,
  referring_url TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_timestamp ON failed_login_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email_success ON failed_login_attempts(email, success);

-- Add RLS policies
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert/select/delete (no public access)
CREATE POLICY "Service role can manage failed login attempts" ON failed_login_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to clean up old failed login attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM failed_login_attempts 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old attempts (optional - can be run manually)
-- SELECT cron.schedule('cleanup-failed-attempts', '0 */6 * * *', 'SELECT cleanup_old_failed_attempts();');
