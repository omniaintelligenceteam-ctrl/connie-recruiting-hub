export type Candidate = {
  id: string;
  first_name: string;
  last_name: string;
  specialty: 'Hematology/Oncology' | 'Gastroenterology' | 'Neurology' | 'OB/GYN' | 'Cardiothoracic Surgery';
  stage: 'Sourced' | 'Contacted' | 'Responded' | 'Phone Screen' | 'Site Visit' | 'Offer' | 'Negotiation' | 'Accepted' | 'Closed/Lost';
  email: string | null;
  phone: string | null;
  current_location: string | null;
  current_employer: string | null;
  source: 'Conference' | 'Referral' | 'Job Board' | 'Cold Outreach' | 'Recruiting Firm' | 'Other' | null;
  notes: string | null;
  next_step: string | null;
  next_step_due: string | null;
  lost_reason: string | null;
  stage_entered_at: string;
  created_at: string;
  updated_at: string;
};

export type Interaction = {
  id: string;
  candidate_id: string | null;
  type: 'Email Sent' | 'Email Received' | 'Phone Call' | 'Voicemail' | 'Text Message' | 'Site Visit' | 'Meeting' | 'Note' | 'Offer Sent' | 'Contract Sent';
  summary: string;
  details: string | null;
  contact_date: string;
  created_at: string;
};

export type EmailDraft = {
  id: string;
  candidate_id: string | null;
  template_name: string | null;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | null;
  sent_at: string | null;
  created_at: string;
};

export type InsertCandidate = Omit<Candidate, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCandidate = Partial<InsertCandidate>;

export type InsertInteraction = Omit<Interaction, 'id' | 'created_at'>;
