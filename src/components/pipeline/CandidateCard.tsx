import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ChevronDown, Mail, Star, Clock, User } from 'lucide-react';
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

function getUrgencyBorder(nextStepDue: string | null) {
  if (!nextStepDue) return 'border-l-emerald-400';
  const daysUntilDue = differenceInCalendarDays(parseISO(nextStepDue), new Date());
  if (daysUntilDue < 0) return 'border-l-red-400';
  if (daysUntilDue <= 2) return 'border-l-amber-400';
  return 'border-l-emerald-400';
}

function getUrgencyDot(nextStepDue: string | null) {
  if (!nextStepDue) return 'bg-emerald-400';
  const daysUntilDue = differenceInCalendarDays(parseISO(nextStepDue), new Date());
  if (daysUntilDue < 0) return 'bg-red-400';
  if (daysUntilDue <= 2) return 'bg-amber-400';
  return 'bg-emerald-400';
}

function computeBadges(candidate: Candidate, interactions: Interaction[]) {
  const now = new Date();
  const sorted = [...interactions].sort((a, b) => a.contact_date < b.contact_date ? 1 : -1);
  const lastAny = sorted[0];
  const daysSinceLast = lastAny
    ? differenceInCalendarDays(now, parseISO(lastAny.contact_date))
    : differenceInCalendarDays(now, parseISO(candidate.stage_entered_at));
  const recentCount = interactions.filter((i) => differenceInCalendarDays(now, parseISO(i.contact_date)) <= 7).length;
  const hasOutreach = interactions.some((i) => i.type === "Email Sent");
  return {
    overdue: daysSinceLast >= 3,
    dueSoon: daysSinceLast === 1 || daysSinceLast === 2,
    hot: recentCount >= 3,
    readyForOutreach: candidate.stage === "Sourced" && !hasOutreach,
  };
}

export default function CandidateCard({ candidate, onClick, interactions = [] }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const daysInStage = formatDistanceToNowStrict(parseISO(candidate.stage_entered_at), { unit: "day", roundingMethod: "floor" });
  const badges = computeBadges(candidate, interactions);
  const urgencyBorder = getUrgencyBorder(candidate.next_step_due);
  const urgencyDot = getUrgencyDot(candidate.next_step_due);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full rounded-xl border-l-4 ${urgencyBorder} bg-white shadow-sm border border-slate-100 border-l-4 p-3 pr-10 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0 w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={14} className="text-primary-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
              Dr. {candidate.first_name} {candidate.last_name}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <span className={`h-2 w-2 rounded-full ${urgencyDot}`} />
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        <div className="mt-2 ml-9">
          <Badge
            label={candidate.specialty}
            colorClass={`${SPECIALTY_COLORS[candidate.specialty] ?? "bg-slate-100 text-slate-700"} text-[10px]`}
          />
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-80 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
          <div className="ml-9 space-y-2.5 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} />
              <span>In stage: {daysInStage}</span>
            </div>

            {candidate.next_step && (
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">Next Step</p>
                <p className="text-xs text-slate-700">{candidate.next_step}</p>
              </div>
            )}

            {candidate.notes && (
              <p className="text-xs text-slate-500 line-clamp-2">{candidate.notes}</p>
            )}

            {(badges.overdue || badges.dueSoon || badges.hot || badges.readyForOutreach) && (
              <div className="flex flex-wrap gap-1.5">
                {badges.overdue && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 border border-red-100">
                    Overdue
                  </span>
                )}
                {!badges.overdue && badges.dueSoon && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-100">
                    Due Soon
                  </span>
                )}
                {badges.hot && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-100">
                    <Star size={9} className="fill-orange-500" /> Hot
                  </span>
                )}
                {badges.readyForOutreach && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-100">
                    <Mail size={9} /> Ready
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClick(candidate); }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors"
            >
              View full profile →
            </button>
          </div>
        </div>
      </button>

      <div className="absolute top-2 right-2">
        <QuickFollowUp candidate={candidate} variant="icon" />
      </div>
    </div>
  );
}
