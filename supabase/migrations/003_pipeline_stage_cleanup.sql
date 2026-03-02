-- Remove deprecated stages and normalize existing candidate records.
-- Contacted/Responded are folded back to Sourced.
-- Negotiation is folded into Offer.

UPDATE candidates
SET stage = CASE
  WHEN stage IN ('Contacted', 'Responded') THEN 'Sourced'
  WHEN stage = 'Negotiation' THEN 'Offer'
  ELSE stage
END
WHERE stage IN ('Contacted', 'Responded', 'Negotiation');

ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_stage_check;

ALTER TABLE candidates
ADD CONSTRAINT candidates_stage_check
CHECK (stage IN ('Sourced', 'Phone Screen', 'Site Visit', 'Offer', 'Accepted', 'Closed/Lost'));
