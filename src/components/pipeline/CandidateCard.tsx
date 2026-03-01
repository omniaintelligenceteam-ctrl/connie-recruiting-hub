import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns';
import type { Candidate } from '../../lib/database.types';
import { SPECIALTY_COLORS } from '../../lib/constants';
import Badge from '../shared/Badge';

type CandidateCardProps = {
  candidate: Candidate;
  onClick: (candidate: Candidate) => void;
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

export default function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const daysInStage = formatDistanceToNowStrict(parseISO(candidate.stage_entered_at), {
    unit: 'day',
    roundingMethod: 'floor',
  });

  return (
    <button
      type="button"
      onClick={() => onClick(candidate)}
      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-base font-bold text-slate-900">
          Dr. {candidate.first_name} {candidate.last_name}
        </p>
        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getUrgencyColor(candidate.next_step_due)}`} />
      </div>

      <div className="mb-2">
        <Badge
          label={candidate.specialty}
          colorClass={SPECIALTY_COLORS[candidate.specialty] ?? 'bg-slate-100 text-slate-700'}
        />
      </div>

      <p className="text-sm text-slate-600">In stage: {daysInStage}</p>
      {candidate.next_step ? (
        <p className="mt-1 text-sm text-slate-700">
          <span className="font-medium">Next:</span> {candidate.next_step}
        </p>
      ) : null}
    </button>
  );
}
