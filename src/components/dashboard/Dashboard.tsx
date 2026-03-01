import { ClipboardList, PlusCircle, Users, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { type ActionItem as SmartActionItem, useActionItems } from '../../hooks/useActionItems';
import { useCandidates } from '../../hooks/useCandidates';
import ActionItem from './ActionItem';
import StatCard from './StatCard';
import EmptyState from '../shared/EmptyState';
import DailyDigest from './DailyDigest';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function handleActionNavigation(item: SmartActionItem, navigate: ReturnType<typeof useNavigate>) {
  if (item.suggestedAction.toLowerCase().includes('email') || item.suggestedAction.toLowerCase().includes('follow')) {
    navigate('/email', { state: { candidateId: item.candidateId } });
    return;
  }
  navigate(`/candidates/${item.candidateId}`);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeCandidates, needsFollowUp, upcomingActions } = useDashboardStats();
  const { actionItems, loading } = useActionItems();
  const { candidates } = useCandidates();

  if (!loading && activeCandidates === 0 && actionItems.length === 0) {
    return <EmptyState icon={PlusCircle} title="No candidates yet" description="Start your pipeline by adding your first doctor. We’ll guide you through it in under a minute." actionLabel="Add New Doctor" onAction={() => navigate('/candidates/new')} />;
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">{getGreeting()}, Connie!</h2>
        <p className="mt-2 text-base text-slate-600">Here&apos;s your recruiting snapshot.</p>
      </header>

      {localStorage.getItem('crh_settings_show_daily_digest') !== 'false' ? <DailyDigest /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Active Candidates" value={activeCandidates} color="blue" icon={Users} />
        <StatCard title="Needs Follow-Up" value={needsFollowUp} color="red" icon={ClipboardList} />
        <StatCard title="Upcoming Actions" value={upcomingActions.length} color="green" icon={Workflow} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-900">Today&apos;s Action Items</h3>
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-500">Loading action items...</div>
        ) : actionItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-500">You&apos;re all caught up for now.</div>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item) => (
              <ActionItem
                key={item.id}
                candidateName={item.candidateName}
                specialty={item.specialty}
                message={item.message}
                suggestedAction={item.suggestedAction}
                urgency={item.urgency}
                candidate={candidates.find((c) => c.id === item.candidateId)}
                onAction={() => handleActionNavigation(item, navigate)}
              />
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={() => navigate('/candidates/new')} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 md:w-auto">Add New Doctor</button>
    </section>
  );
}
