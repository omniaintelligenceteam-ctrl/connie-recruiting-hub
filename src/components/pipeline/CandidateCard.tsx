import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Mail, Star } from 'lucide-react';
import type { Candidate, Interaction } from '../../lib/database.types';
import { SPECIALTY_COLORS } from '../../lib/constants';
import Badge from '../shared/Badge';
import QuickFollowUp from '../candidates/QuickFollowUp';

type CandidateCardProps = {
  candidate: Candidate;
  onClick: (candidate: Candidate) => void;
  /** Optional recent interactions for badge computation */
  interactions?: Interaction[];
};

// ─── Urgency dot (existing behaviour, preserved) ──────────────────────────────

function getUrgencyColor(nextStepDue: string | null) {
  if (!nextStepDue) return 'bg-green-500';
  const dueDate = parseISO(nextStepDue);
  const today = new Date();
  const daysUntilDue = differenceInCalendarDays(dueDate, today);
  if (daysUntilDue < 0) return 'bg-red-500';
  if (daysUntilDue <= 2) return 'bg-amber-500';
  return 'bg-green-500';
}

// ─── Activity badges ──────────────────────────────────────────────────────────

interface ActivityBadges {
  /** 🔴 action overdue — 3+ days since any activity */
  overdue: boolean;
  /** 🟡 follow-up due soon — activity within 1-2 days */
  dueSoon: boolean;
  /** ⭐ hot — 3+ interactions in the last 7 days */
  hot: boolean;
  /** ✉️ ready for outreach — Sourced/Contacted with no recent email */
  readyForOutreach: boolean;
}

function computeBadges(candidate: Candidate, interactions: Interaction[]): ActivityBadges {
  const now = new Date();

  // Days since last interaction of any kind
  const sorted = [...interactions].sort((a, b) =>
    a.contact_date < b.contact_date ? 1 : -1,
  );
  const lastAny = sorted[0];
  const daysSinceLast = lastAny
    ? differenceInCalendarDays(now, parseISO(lastAny.contact_date))
    : differenceInCalendarDays(now, parseISO(candidate.stage_entered_at));

  // Hot: 3+ interactions in last 7 days
  const recentCount = interactions.filter(
    (i) => differenceInCalendarDays(now, parseISO(i.contact_date)) <= 7,
  ).length;

  // Ready for outreach
  const hasOutreach = interactions.some((i) => i.type === 'Email Sent');
  const isEarlyStage = candidate.stage === 'Sourced' || candidate.stage === 'Contacted';

  return {
    overdue: daysSinceLast >= 3,
    dueSoon: daysSinceLast === 1 || daysSinceLast === 2,
    hot: recentCount >= 3,
    readyForOutreach: isEarlyStage && !hasOutreach,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CandidateCard({ candidate, onClick, interactions = [] }: CandidateCardProps) {
  const daysInStage = formatDistanceToNowStrict(parseISO(candidate.stage_entered_at), {
    unit: 'day',
    roundingMethod: 'floor',
  });

  const badges = computeBadges(candidate, interactions);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onClick(candidate)}
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white p-2.5 pr-11 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        {/* Name + urgency dot */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">
            Dr. {candidate.first_name} {candidate.last_name}
          </p>
          <span
            className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getUrgencyColor(candidate.next_step_due)}`}
          />
        </div>

        {/* Specialty badge */}
        <div className="mb-1.5">
          <Badge
            label={candidate.specialty}
            colorClass={SPECIALTY_COLORS[candidate.specialty] ?? 'bg-slate-100 text-slate-700'}
          />
        </div>

        {/* Stage duration */}
        <p className="text-xs text-slate-600">In stage: {daysInStage}</p>

        {/* Next step */}
        {candidate.next_step ? (
          <p className="mt-1 text-xs text-slate-700">
            <span className="font-medium">Next:</span> {candidate.next_step}
          </p>
        ) : null}

        {/* Activity badges row */}
        {(badges.overdue || badges.dueSoon || badges.hot || badges.readyForOutreach) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {badges.overdue && (
              <span
                title="Action overdue — 3+ days no activity"
                className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
              >
                🔴 Overdue
              </span>
            )}
            {!badges.overdue && badges.dueSoon && (
              <span
                title="Check-in due soon"
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
              >
                🟡 Due Soon
              </span>
            )}
            {badges.hot && (
              <span
                title="Hot candidate — multiple recent interactions"
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
              >
                <Star size={10} className="fill-orange-500 text-orange-500" />
                Hot
              </span>
            )}
            {badges.readyForOutreach && (
              <span
                title="Ready for initial outreach"
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                <Mail size={10} />
                Outreach Ready
              </span>
            )}
          </div>
        )}
      </button>

      {/* Quick follow-up button */}
      <div className="absolute top-2 right-2">
        <QuickFollowUp candidate={candidate} variant="icon" />
      </div>
    </div>
  );
}
