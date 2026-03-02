CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Sourced' CHECK (stage IN ('Sourced', 'Phone Screen', 'Site Visit', 'Offer', 'Accepted', 'Closed/Lost')),
  email TEXT,
  phone TEXT,
  current_location TEXT,
  current_employer TEXT,
  source TEXT CHECK (source IN ('Conference', 'Referral', 'Job Board', 'Cold Outreach', 'Recruiting Firm', 'Other')),
  notes TEXT,
  next_step TEXT,
  next_step_due DATE,
  lost_reason TEXT,
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidates_stage ON candidates(stage);
CREATE INDEX idx_candidates_specialty ON candidates(specialty);
CREATE INDEX idx_candidates_next_step_due ON candidates(next_step_due);

CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Email Sent', 'Email Received', 'Phone Call', 'Voicemail', 'Text Message', 'Site Visit', 'Meeting', 'Note', 'Offer Sent', 'Contract Sent')),
  summary TEXT NOT NULL,
  details TEXT,
  contact_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_candidate ON interactions(candidate_id);
CREATE INDEX idx_interactions_date ON interactions(contact_date);

CREATE TABLE email_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  template_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_stage_entered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage != OLD.stage THEN
    NEW.stage_entered_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidates_stage_change
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_stage_entered_at();
