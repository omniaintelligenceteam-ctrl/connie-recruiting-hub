import { differenceInDays, parseISO } from 'date-fns';
import type { Candidate, Interaction } from './database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionType =
  | 'send_outreach'
  | 'schedule_followup_call'
  | 'request_documents'
  | 'submit_to_client'
  | 'interview_prep'
  | 'send_rejection'
  | 'nurture_touch'
  | 'check_in';

export interface Recommendation {
  action: ActionType;
  priority: 'high' | 'medium' | 'low';
  message: string;
  reason: string;
  oneClick?: boolean;
  template?: string;
  suggestedDate?: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string, now: Date): number {
  return differenceInDays(now, parseISO(dateStr));
}

function lastOfType(
  interactions: Interaction[],
  types: Array<Interaction['type']>,
): Interaction | undefined {
  return interactions
    .filter((i) => types.includes(i.type))
    .sort((a, b) => (a.contact_date < b.contact_date ? 1 : -1))[0];
}

function hasKeyword(interactions: Interaction[], ...keywords: string[]): boolean {
  return interactions.some((i) =>
    keywords.some(
      (kw) =>
        i.summary.toLowerCase().includes(kw) ||
        (i.details ?? '').toLowerCase().includes(kw),
    ),
  );
}

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Pure function. Returns the single highest-priority recommended next action,
 * or null when there is nothing actionable.
 */
export function recommendNextStep(
  candidate: Candidate,
  interactions: Interaction[],
  now: Date,
): Recommendation | null {
  const stageAge = daysSince(candidate.stage_entered_at, now);

  // ── Rule 1: Sourced, no outreach after 2 days ─────────────────────────────
  if (candidate.stage === 'Sourced') {
    const outreachSent = lastOfType(interactions, ['Email Sent']);
    if (!outreachSent && stageAge >= 2) {
      return {
        action: 'send_outreach',
        priority: 'high',
        message: `Dr. ${candidate.last_name} has been sourced for ${stageAge} day${stageAge === 1 ? '' : 's'} with no outreach yet.`,
        reason: 'No email sent since being sourced 2+ days ago.',
        oneClick: true,
        template: 'initial_outreach',
        suggestedDate: now,
      };
    }
  }

  // ── Rule 2: Phone Screen, no docs requested after 5 days ─────────────────
  if (candidate.stage === 'Phone Screen') {
    const hasDocRequest = hasKeyword(interactions, 'cv', 'document', 'curriculum', 'resume');
    if (!hasDocRequest && stageAge >= 5) {
      return {
        action: 'request_documents',
        priority: 'high',
        message: `Request CV / documents from Dr. ${candidate.last_name} — ${stageAge} days in Phone Screen.`,
        reason: 'Candidate in Phone Screen 5+ days with no document request logged.',
        suggestedDate: now,
      };
    }
  }

  // ── Rule 4: Site Visit, tomorrow ─────────────────────────────────────────
  if (candidate.stage === 'Site Visit') {
    if (candidate.next_step_due) {
      const daysUntilDue = differenceInDays(parseISO(candidate.next_step_due), now);
      if (daysUntilDue === 1) {
        return {
          action: 'interview_prep',
          priority: 'high',
          message: `Site visit for Dr. ${candidate.last_name} is TOMORROW — open prep sheet now.`,
          reason: 'next_step_due is tomorrow and candidate is in Site Visit stage.',
          oneClick: true,
          suggestedDate: now,
        };
      }
    }
    const hasPrep = hasKeyword(interactions, 'prep') || !!lastOfType(interactions, ['Meeting']);
    if (!hasPrep && stageAge >= 1 && stageAge <= 3) {
      return {
        action: 'interview_prep',
        priority: 'high',
        message: `Prep Dr. ${candidate.last_name} for upcoming site visit.`,
        reason: 'In Site Visit stage but no prep session logged yet.',
        suggestedDate: now,
      };
    }
  }

  // ── Rule 4: Offer, no feedback after 7 days ───────────────────────────────
  if (candidate.stage === 'Offer') {
    const hasClientFeedback = hasKeyword(interactions, 'client', 'feedback', 'counter', 'decision');
    if (!hasClientFeedback && stageAge >= 7) {
      return {
        action: 'nurture_touch',
        priority: 'medium',
        message: `No client feedback on Dr. ${candidate.last_name}'s offer — ${stageAge} days waiting.`,
        reason: 'In Offer 7+ days with no feedback logged.',
        suggestedDate: now,
      };
    }
  }

  // ── Rule 5: Accepted, 30-day check-in ────────────────────────────────────
  if (candidate.stage === 'Accepted') {
    const lastTouch = lastOfType(interactions, [
      'Phone Call',
      'Email Sent',
      'Text Message',
      'Meeting',
    ]);
    const sinceTouch = lastTouch ? daysSince(lastTouch.contact_date, now) : stageAge;
    if (sinceTouch >= 30) {
      return {
        action: 'check_in',
        priority: 'low',
        message: `Check in with Dr. ${candidate.last_name} — ${sinceTouch} days since last contact.`,
        reason: 'Accepted 30+ days ago with no recent touchpoint.',
        suggestedDate: now,
      };
    }
  }


  return null;
}
