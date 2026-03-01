import { ClipboardList, PlusCircle, Users, Workflow } from 'lucide-react';
import { isBefore, isToday, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import type { Candidate } from '../../lib/database.types';
import ActionItem from './ActionItem';
import StatCard from './StatCard';
import EmptyState from '../shared/EmptyState';

type Urgency = 'overdue' | 'due-soon' | 'on-track';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getUrgency(candidate: Candidate): Urgency {
  if (!candidate.next_step_due) return 'on-track';

  const dueDate = parseISO(candidate.next_step_due);
  const now = new Date();

  if (isBefore(dueDate, now) && !isToday(dueDate)) return 'overdue';
  if (isToday(dueDate)) return 'due-soon';
  return 'on-track';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeCandidates, needsFollowUp, upcomingActions, loading } = useDashboardStats();

  const sortedActions = useMemo(() => {
    const rank: Record<Urgency, number> = { overdue: 0, 'due-soon': 1, 'on-track': 2 };
    return [...upcomingActions].sort((a, b) => rank[getUrgency(a)] - rank[getUrgency(b)]);
  }, [upcomingActions]);

  if (!loading && activeCandidates === 0 && upcomingActions.length === 0) {
    return (
      <EmptyState
        icon={PlusCircle}
        title="No candidates yet"
        description="Start your pipeline by adding your first doctor. We’ll guide you through it in under a minute."
        actionLabel="Add New Doctor"
        onAction={() => navigate('/candidates/new')}
      />
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">{getGreeting()}, Connie!</h2>
        <p className="mt-2 text-base text-slate-600">Here&apos;s your recruiting snapshot.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Active Candidates" value={activeCandidates} color="blue" icon={Users} />
        <StatCard title="Needs Follow-Up" value={needsFollowUp} color="red" icon={ClipboardList} />
        <StatCard
          title="Upcoming Actions"
          value={upcomingActions.length}
          color="green"
          icon={Workflow}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-900">Today&apos;s Action Items</h3>
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-500">
            Loading action items...
          </div>
        ) : sortedActions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-500">
            You&apos;re all caught up for now.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActions.map((candidate) => (
              <ActionItem
                key={candidate.id}
                candidate={candidate}
                actionLabel={candidate.next_step ?? 'Review candidate profile'}
                urgency={getUrgency(candidate)}
                onAction={(item) => navigate(`/candidates/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/candidates/new')}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 md:w-auto"
      >
        Add New Doctor
      </button>
    </section>
  );
}
