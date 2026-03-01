import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useInteractions } from '../../hooks/useInteractions';
import Badge from '../shared/Badge';

type CandidateTimelineProps = {
  candidateId: string;
};

const typeDotColor: Record<string, string> = {
  'Email Sent': 'bg-blue-500',
  'Email Received': 'bg-cyan-500',
  'Phone Call': 'bg-emerald-500',
  Voicemail: 'bg-amber-500',
  'Text Message': 'bg-purple-500',
  'Site Visit': 'bg-indigo-500',
  Meeting: 'bg-pink-500',
  Note: 'bg-slate-500',
  'Offer Sent': 'bg-green-500',
  'Contract Sent': 'bg-green-600',
};

export default function CandidateTimeline({ candidateId }: CandidateTimelineProps) {
  const { interactions, fetchInteractions, loading } = useInteractions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) return;
    void fetchInteractions(candidateId);
  }, [candidateId, fetchInteractions]);

  if (loading && interactions.length === 0) {
    return <p className="text-base text-slate-600">Loading timeline...</p>;
  }

  if (interactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="text-lg font-semibold text-slate-800">No interactions yet</p>
        <p className="mt-1 text-base text-slate-600">Log the first touchpoint for this doctor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((entry) => {
        const isExpanded = expandedId === entry.id;

        return (
          <article key={entry.id} className="relative pl-8">
            <span className="absolute top-1 left-2 h-full w-0.5 bg-slate-200" />
            <span
              className={`absolute top-2 left-[5px] h-3 w-3 rounded-full ${typeDotColor[entry.type] ?? 'bg-slate-500'}`}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-slate-500">
                  {format(new Date(entry.contact_date), 'MMM d, yyyy p')}
                </p>
                <Badge label={entry.type} colorClass="bg-blue-100 text-blue-700" />
              </div>

              <p className="text-sm text-slate-800">{entry.summary}</p>

              {entry.details ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="mt-2 text-xs font-semibold text-blue-700"
                  >
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </button>
                  {isExpanded ? <p className="mt-1 text-sm text-slate-600">{entry.details}</p> : null}
                </>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
