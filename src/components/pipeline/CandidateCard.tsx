import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ChevronDown, Mail, Star } from 'lucide-react';
import { useState } from 'react';
import type { Candidate, Interaction } from '../../lib/database.types';
import { SPECIALTY_COLORS } from '../../lib/constants';
import Badge from '../shared/Badge';
import QuickFollowUp from '../candidates/QuickFollowUp';

type CandidateCardProps = {
  candidate: Candidate;
  onClick: (candidate: Candidate) => void;
  interactions?: Interaction[];
};

function getUrgencyColor(nextStepDue: string | null) {
  if (!nextStepDue) return 'bg-green-500';
  const dueDate = parseISO(nextStepDue);
  const today = new Date();
  const daysUntilDue = differenceInCalendarDays(dueDate, today);
  if (daysUntilDue < 0) return 'bg-red-500';
  if (daysUntilDue <= 2) return 'bg-amber-500';
  return 'bg-green-500';
}

interface ActivityBadges {
  overdue: boolean;
  dueSoon: boolean;
  hot: boolean;
  readyForOutreach: boolean;
}

function computeBadges(candidate: Candidate, interactions: Interaction[]): ActivityBadges {
  const now = new Date();

  const sorted = [...interactions].sort((a, b) =>
    a.contact_date < b.contact_date ? 1 : -1,
  );
  const lastAny = sorted[0];
  const daysSinceLast = lastAny
    ? differenceInCalendarDays(now, parseISO(lastAny.contact_date))
    : differenceInCalendarDays(now, parseISO(candidate.stage_entered_at));

  const recentCount = interactions.filter(
    (i) => differenceInCalendarDays(now, parseISO(i.contact_date)) <= 7,
  ).length;

  const hasOutreach = interactions.some((i) => i.type === 'Email Sent');
  const isEarlyStage = candidate.stage === 'Sourced';

  return {
    overdue: daysSinceLast >= 3,
    dueSoon: daysSinceLast === 1 || daysSinceLast === 2,
    hot: recentCount >= 3,
    readyForOutreach: isEarlyStage && !hasOutreach,
  };
}

export default function CandidateCard({ candidate, onClick, interactions = [] }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const daysInStage = formatDistanceToNowStrict(parseISO(candidate.stage_entered_at), {
    unit: 'day',
    roundingMethod: 'floor',
  });

  const badges = computeBadges(candidate, interactions);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white p-2.5 pr-11 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">
            Dr. {candidate.first_name} {candidate.last_name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getUrgencyColor(candidate.next_step_due)}`} />
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        <div className="mt-1.5">
          <Badge
            label={candidate.specialty}
            colorClass={SPECIALTY_COLORS[candidate.specialty] ?? 'bg-slate-100 text-slate-700'}
          />
        </div>

        <div
          className={`overflow-hidden transition-all duration-200 ${expanded ? 'max-h-72 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
        >
          <p className="text-xs text-slate-600">In stage: {daysInStage}</p>

          {candidate.next_step ? (
            <p className="mt-1 text-xs text-slate-700">
              <span className="font-medium">Next:</span> {candidate.next_step}
            </p>
          ) : null}

          {candidate.notes ? (
            <p className="mt-1 text-xs text-slate-600 line-clamp-3">
              <span className="font-medium text-slate-700">Notes:</span> {candidate.notes}
            </p>
          ) : null}

          {(badges.overdue || badges.dueSoon || badges.hot || badges.readyForOutreach) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {badges.overdue && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  🔴 Overdue
                </span>
              )}
              {!badges.overdue && badges.dueSoon && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  🟡 Due Soon
                </span>
              )}
              {badges.hot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  <Star size={10} className="fill-orange-500 text-orange-500" />
                  Hot
                </span>
              )}
              {badges.readyForOutreach && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Mail size={10} />
                  Outreach Ready
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick(candidate);
            }}
            className="mt-2 text-xs font-medium text-blue-700 hover:underline"
          >
            View full profile
          </button>
        </div>
      </button>

      <div className="absolute top-2 right-8">
        <QuickFollowUp candidate={candidate} variant="icon" />
      </div>
    </div>
  );
}
