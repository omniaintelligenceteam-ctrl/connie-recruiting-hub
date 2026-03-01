import { ArrowRight } from 'lucide-react';
import type { Candidate } from '../../lib/database.types';
import { SPECIALTY_COLORS } from '../../lib/constants';
import Badge from '../shared/Badge';

type ActionItemProps = {
  candidate: Candidate;
  actionLabel: string;
  urgency: 'overdue' | 'due-soon' | 'on-track';
  onAction: (candidate: Candidate) => void;
};

const urgencyStyles = {
  overdue: 'border-l-red-600 bg-red-50/40',
  'due-soon': 'border-l-amber-500 bg-amber-50/40',
  'on-track': 'border-l-green-600 bg-green-50/40',
};

export default function ActionItem({ candidate, actionLabel, urgency, onAction }: ActionItemProps) {
  return (
    <button
      type="button"
      onClick={() => onAction(candidate)}
      className={`w-full rounded-xl border border-slate-200 border-l-4 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${urgencyStyles[urgency]}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">
              Dr. {candidate.first_name} {candidate.last_name}
            </h4>
            <Badge
              label={candidate.specialty}
              colorClass={SPECIALTY_COLORS[candidate.specialty] ?? 'bg-slate-100 text-slate-700'}
            />
          </div>
          <p className="text-base text-slate-600">{actionLabel}</p>
        </div>

        <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-base font-semibold text-white">
          Open
          <ArrowRight size={18} />
        </span>
      </div>
    </button>
  );
}
