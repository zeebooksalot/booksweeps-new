-- Add Bonus Entry Support to Giveaway System
-- Extends the existing giveaway system with bonus entry functionality

-- Add bonus entry configuration to giveaways table
ALTER TABLE giveaways ADD COLUMN entry_methods JSONB DEFAULT '{}';

-- Add bonus entry amount and entry data to giveaway_entries
ALTER TABLE giveaway_entries ADD COLUMN bonus_entries INTEGER DEFAULT 1;
ALTER TABLE giveaway_entries ADD COLUMN entry_data JSONB DEFAULT '{}';

-- Update entry method constraint to include bonus entry types
ALTER TABLE giveaway_entries DROP CONSTRAINT IF EXISTS giveaway_entries_entry_method_check;
ALTER TABLE giveaway_entries ADD CONSTRAINT giveaway_entries_entry_method_check 
  CHECK (entry_method IN ('email', 'twitter', 'facebook', 'newsletter', 'early_bird_books'));

-- Update unique constraint to allow multiple entry methods per email/giveaway
ALTER TABLE giveaway_entries DROP CONSTRAINT IF EXISTS giveaway_entries_giveaway_id_email_key;
ALTER TABLE giveaway_entries ADD CONSTRAINT giveaway_entries_giveaway_id_email_entry_method_key 
  UNIQUE(giveaway_id, email, entry_method);

-- Add index for entry methods
CREATE INDEX idx_giveaway_entries_entry_method ON giveaway_entries(entry_method);

-- Update the entry count trigger to handle bonus entries
CREATE OR REPLACE FUNCTION update_giveaway_entry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Security: Only update if giveaway exists and is active
    UPDATE giveaways 
    SET entry_count = entry_count + COALESCE(NEW.bonus_entries, 1), updated_at = NOW()
    WHERE id = NEW.giveaway_id 
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Security: Only update if giveaway exists
    UPDATE giveaways 
    SET entry_count = GREATEST(0, entry_count - COALESCE(OLD.bonus_entries, 1)), updated_at = NOW()
    WHERE id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for entries to handle multiple entry methods
DROP POLICY IF EXISTS "Anyone can create entries" ON giveaway_entries;
CREATE POLICY "Anyone can create entries" ON giveaway_entries
  FOR INSERT WITH CHECK (
    -- Ensure giveaway exists and is active
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE id = giveaway_id 
      AND status = 'active' 
      AND (end_date IS NULL OR end_date > NOW())
    )
    -- Prevent duplicate entries for same email/giveaway/method combination
    AND NOT EXISTS (
      SELECT 1 FROM giveaway_entries 
      WHERE giveaway_id = giveaway_entries.giveaway_id 
      AND email = giveaway_entries.email
      AND entry_method = giveaway_entries.entry_method
    )
  );

-- Add comment for documentation
COMMENT ON COLUMN giveaways.entry_methods IS 'JSONB object defining available entry methods and their bonus amounts. Example: {"twitter": {"bonus_entries": 2, "config": {"handle": "@author"}}, "newsletter": {"bonus_entries": 1}}';
COMMENT ON COLUMN giveaway_entries.bonus_entries IS 'Number of entries this method provides (default: 1)';
COMMENT ON COLUMN giveaway_entries.entry_data IS 'JSONB object storing method-specific data (e.g., social media handles, verification data)';
