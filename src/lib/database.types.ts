export type Candidate = {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  stage: 'Sourced' | 'Phone Screen' | 'Site Visit' | 'Offer' | 'Accepted' | 'Closed/Lost';
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


export type Report = {
  id: string;
  title: string;
  generated_at: string;
  content: string;
  report_type: string;
};

export interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  attendees: string;
}

export interface NotifyPerson {
  id: string;
  name: string;
  role: string;
  notified: boolean;
  notified_at?: string | null;
}

export type SiteVisit = {
  id: string;
  candidate_id: string | null;
  visit_date: string | null;
  visit_end_date: string | null;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  flight_booked: boolean;
  hotel_booked: boolean;
  rental_car: boolean;
  travel_notes: string | null;
  schedule: ScheduleItem[];
  notify_list: NotifyPerson[];
  visit_rating: 'hot' | 'warm' | 'lukewarm' | 'not_a_fit' | null;
  visit_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertCandidate = Omit<Candidate, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCandidate = Partial<InsertCandidate>;

export type InsertInteraction = Omit<Interaction, 'id' | 'created_at'>;

export type InsertSiteVisit = Omit<SiteVisit, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSiteVisit = Partial<InsertSiteVisit>;

export type FutureDoctor = {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  current_school: string | null;
  current_program: string | null;
  expected_start_year: number | null;
  how_connected: 'Conference' | 'Referral' | 'Future Physicians Program' | 'Cold Outreach' | 'Other' | null;
  notes: string | null;
  next_checkin: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertFutureDoctor = {
  first_name: string;
  last_name: string;
  specialty?: string | null;
  current_school?: string | null;
  current_program?: string | null;
  expected_start_year?: number | null;
  how_connected?: 'Conference' | 'Referral' | 'Future Physicians Program' | 'Cold Outreach' | 'Other' | null;
  notes?: string | null;
  next_checkin?: string | null;
};
export type UpdateFutureDoctor = Partial<InsertFutureDoctor>;
