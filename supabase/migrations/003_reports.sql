CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  report_type TEXT DEFAULT 'pipeline'
);

ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at DESC);
