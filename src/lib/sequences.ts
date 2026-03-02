// ─── Email Sequence Definitions ───────────────────────────────────────────────
// Each step defines when to send (day offset from sequence start), which
// template to use, and under what condition the step should fire.

export type SequenceCondition =
  | 'always'        // send regardless
  | 'no_reply'      // only if candidate has not replied
  | 'opened_no_reply' // email opened but no reply (requires open-tracking)
  | 'sourced'       // candidate is in Sourced stage
  | 'interview_done' // interview/site-visit completed
  | 'client';       // action targets the client, not the candidate

export interface SequenceStep {
  day: number;                // days offset from sequence start (0 = same day)
  template: string;           // key into EMAIL_TEMPLATES / custom templates
  condition: SequenceCondition;
  label: string;              // human-readable description
}

export interface Sequence {
  id: string;
  name: string;
  description: string;
  steps: SequenceStep[];
}

export const SEQUENCES: Record<string, Sequence> = {
  physician_outreach: {
    id: 'physician_outreach',
    name: 'Physician Outreach',
    description: 'Standard cold-outreach cadence for newly sourced physicians.',
    steps: [
      {
        day: 0,
        template: 'initial_outreach',
        condition: 'sourced',
        label: 'Initial outreach email',
      },
      {
        day: 3,
        template: 'follow_up_1',
        condition: 'no_reply',
        label: 'Follow-up #1 — no reply',
      },
      {
        day: 7,
        template: 'value_add',
        condition: 'opened_no_reply',
        label: 'Value-add touch — opened but no reply',
      },
      {
        day: 14,
        template: 'follow_up_2',
        condition: 'no_reply',
        label: 'Final breakup email',
      },
    ],
  },

  post_interview: {
    id: 'post_interview',
    name: 'Post-Interview / Site Visit',
    description: 'Follow-up cadence after a site visit is completed.',
    steps: [
      {
        day: 0,
        template: 'post_phone_screen',
        condition: 'interview_done',
        label: 'Thank-you / debrief email to candidate',
      },
      {
        day: 1,
        template: 'client_feedback_request',
        condition: 'client',
        label: 'Request feedback from client/department',
      },
      {
        day: 3,
        template: 'candidate_debrief',
        condition: 'always',
        label: 'Candidate debrief & next-steps call',
      },
    ],
  },

  site_visit_prep: {
    id: 'site_visit_prep',
    name: 'Site Visit Prep',
    description: 'Pre-visit communication cadence to prepare candidate.',
    steps: [
      {
        day: -7,
        template: 'site_visit_invite',
        condition: 'always',
        label: 'Site visit confirmation & logistics',
      },
      {
        day: -3,
        template: 'site_visit_reminder',
        condition: 'always',
        label: '3-day reminder with itinerary',
      },
      {
        day: -1,
        template: 'site_visit_eve',
        condition: 'always',
        label: 'Day-before reminder & travel check',
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSequenceById(id: string): Sequence | undefined {
  return SEQUENCES[id];
}

export function getAllSequences(): Sequence[] {
  return Object.values(SEQUENCES);
}
