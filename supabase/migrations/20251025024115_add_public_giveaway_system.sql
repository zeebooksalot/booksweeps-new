-- Public Giveaway System Migration
-- Creates tables for public giveaways and entries, using JSONB for complex data

-- Public giveaways table (separate from campaigns which is for author dashboard)
CREATE TABLE giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  book_data JSONB NOT NULL, -- Stores GiveawayBook interface
  author_data JSONB NOT NULL, -- Stores GiveawayAuthor interface
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_entries INTEGER,
  entry_count INTEGER DEFAULT 0,
  number_of_winners INTEGER DEFAULT 1,
  prize_description TEXT,
  rules TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'draft')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Giveaway entries table
CREATE TABLE giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entry_method TEXT DEFAULT 'email' CHECK (entry_method IN ('email', 'google', 'twitter')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(giveaway_id, email)
);

-- Indexes for performance at scale (20K+ entries/month)
CREATE INDEX idx_giveaway_entries_giveaway_id ON giveaway_entries(giveaway_id);
CREATE INDEX idx_giveaway_entries_created_at ON giveaway_entries(created_at DESC);
CREATE INDEX idx_giveaway_entries_email ON giveaway_entries(email);
CREATE INDEX idx_giveaway_entries_giveaway_created ON giveaway_entries(giveaway_id, created_at);

-- Indexes for giveaways
CREATE INDEX idx_giveaways_status ON giveaways(status);
CREATE INDEX idx_giveaways_end_date ON giveaways(end_date);
CREATE INDEX idx_giveaways_featured ON giveaways(is_featured);

-- Enable RLS
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for giveaways
CREATE POLICY "Anyone can view active giveaways" ON giveaways
  FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view ended giveaways" ON giveaways
  FOR SELECT USING (status = 'ended');

-- Admin policies for giveaway management
CREATE POLICY "Service role can manage giveaways" ON giveaways
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can create giveaways" ON giveaways
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own giveaways" ON giveaways
  FOR UPDATE USING (auth.uid()::text = (author_data->>'user_id'));

-- RLS Policies for giveaway_entries
CREATE POLICY "Users can view their own entries" ON giveaway_entries
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create entries" ON giveaway_entries
  FOR INSERT WITH CHECK (
    -- Ensure giveaway exists and is active
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE id = giveaway_id 
      AND status = 'active' 
      AND (end_date IS NULL OR end_date > NOW())
    )
    -- Prevent duplicate entries for same email/giveaway
    AND NOT EXISTS (
      SELECT 1 FROM giveaway_entries 
      WHERE giveaway_id = giveaway_entries.giveaway_id 
      AND email = giveaway_entries.email
    )
  );

-- Function to update entry count when entries are added/removed
CREATE OR REPLACE FUNCTION update_giveaway_entry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Security: Only update if giveaway exists and is active
    UPDATE giveaways 
    SET entry_count = entry_count + 1, updated_at = NOW()
    WHERE id = NEW.giveaway_id 
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Security: Only update if giveaway exists
    UPDATE giveaways 
    SET entry_count = GREATEST(0, entry_count - 1), updated_at = NOW()
    WHERE id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update entry count
CREATE TRIGGER trigger_update_giveaway_entry_count
  AFTER INSERT OR DELETE ON giveaway_entries
  FOR EACH ROW EXECUTE FUNCTION update_giveaway_entry_count();

-- Additional security policies for giveaway_entries
CREATE POLICY "Service role can manage entries" ON giveaway_entries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can delete their own entries" ON giveaway_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions (minimal required)
GRANT SELECT ON giveaways TO anon, authenticated;
GRANT SELECT, INSERT ON giveaway_entries TO anon, authenticated;
GRANT UPDATE(entry_count, updated_at) ON giveaways TO anon, authenticated;

-- Create indexes for security queries
CREATE INDEX idx_giveaway_entries_user_id ON giveaway_entries(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_giveaways_status_end_date ON giveaways(status, end_date) WHERE status = 'active';
