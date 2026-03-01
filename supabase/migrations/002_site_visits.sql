CREATE TABLE site_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  visit_date DATE,
  visit_end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),

  -- Travel
  flight_booked BOOLEAN DEFAULT FALSE,
  hotel_booked BOOLEAN DEFAULT FALSE,
  rental_car BOOLEAN DEFAULT FALSE,
  travel_notes TEXT,

  -- Schedule (stored as JSON array)
  schedule JSONB DEFAULT '[]'::jsonb,

  -- People to notify
  notify_list JSONB DEFAULT '[]'::jsonb,

  -- Post-visit
  visit_rating TEXT CHECK (visit_rating IN ('hot', 'warm', 'lukewarm', 'not_a_fit')),
  visit_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_visits_candidate ON site_visits(candidate_id);
CREATE INDEX idx_site_visits_date ON site_visits(visit_date);

ALTER TABLE site_visits DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER site_visits_updated_at
  BEFORE UPDATE ON site_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
