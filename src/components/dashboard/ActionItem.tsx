import { ArrowRight } from 'lucide-react';
import type { Candidate } from '../../lib/database.types';
import Badge from '../shared/Badge';
import QuickFollowUp from '../candidates/QuickFollowUp';

type ActionItemProps = {
  candidateName: string;
  specialty: string;
  message: string;
  suggestedAction: string;
  urgency: 'high' | 'medium' | 'low';
  onAction: () => void;
  candidate?: Candidate;
};

const urgencyStyles = {
  high: 'border-l-red-600 bg-red-50/40',
  medium: 'border-l-amber-500 bg-amber-50/40',
  low: 'border-l-green-600 bg-green-50/40',
};

export default function ActionItem({ candidateName, specialty, message, suggestedAction, urgency, onAction, candidate }: ActionItemProps) {
  return (
    <div className={`w-full rounded-xl border border-slate-200 border-l-4 p-4 text-left shadow-sm ${urgencyStyles[urgency]}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={onAction} className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">Dr. {candidateName}</h4>
            <Badge label={specialty} colorClass="bg-slate-100 text-slate-700" />
          </div>
          <p className="text-base text-slate-600">{message}</p>
        </button>
        <div className="flex items-center gap-2">
          {candidate ? <QuickFollowUp candidate={candidate} /> : null}
          <button type="button" onClick={onAction} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-base font-semibold text-white">
            {suggestedAction}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
