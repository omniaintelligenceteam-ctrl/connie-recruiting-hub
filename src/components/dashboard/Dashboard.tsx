import { useState } from 'react';
import { ClipboardList, PlusCircle, Users, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useCandidates } from '../../hooks/useCandidates';
import SmartCollections from './SmartCollections';
import type { CollectionFilter } from './SmartCollections';
import ActionBasedViews from './ActionBasedViews';
import EmptyState from '../shared/EmptyState';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: typeof Users;
  trend?: string;
  color: 'blue' | 'amber' | 'emerald';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 ${colorClasses[color]} border`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp size={14} />
            {trend}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-600">{title}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
      
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeCandidates, needsFollowUp, upcomingActions } = useDashboardStats();
  const { candidates, loading } = useCandidates();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [showActionView, setShowActionView] = useState(false);

  const handleCollectionSelect = (filter: CollectionFilter) => {
    setActiveCollection(filter.id);
    setShowActionView(false);
  };

  const handleActionView = (actionType: string, candidateIds: string[]) => {
    setShowActionView(true);
    setActiveCollection(actionType);
    // Navigate to pipeline with these candidates highlighted
    navigate('/pipeline', { state: { highlightedIds: candidateIds, actionType } });
  };

  const handleClearFilter = () => {
    setActiveCollection(null);
    setShowActionView(false);
  };

  if (!loading && candidates.length === 0) {
    return (
      <EmptyState
        icon={PlusCircle}
        title="No candidates yet"
        description="Start your pipeline by adding your first doctor. We'll guide you through it in under a minute."
        actionLabel="Add New Doctor"
        onAction={() => navigate('/candidates/new')}
      />
    );
  }

  return (
    <section className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-3xl font-display font-bold text-slate-900">
          {getGreeting()}, Connie!
        </h2>
        <p className="text-base text-slate-500">
          Here&apos;s your recruiting snapshot for today
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Active Candidates"
          value={activeCandidates}
          subtitle="In your pipeline"
          icon={Users}
          color="blue"
          trend="+12% this month"
        />
        <StatCard
          title="Needs Follow-Up"
          value={needsFollowUp}
          subtitle="Overdue or due today"
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          title="Upcoming Actions"
          value={upcomingActions.length}
          subtitle="Next 7 days"
          icon={Calendar}
          color="emerald"
        />
      </div>

      {/* Smart Collections */}
      <SmartCollections 
        candidates={candidates}
        onSelectCollection={handleCollectionSelect}
        activeCollection={activeCollection}
      />

      {/* Action-Based Views */}
      <ActionBasedViews 
        candidates={candidates}
        onViewAction={handleActionView}
      />

      {/* Quick Add Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => navigate('/candidates/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-700/25 transition-all duration-200 hover:bg-primary-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle size={20} />
          Add New Doctor
        </button>
        
        {(activeCollection || showActionView) && (
          <button
            type="button"
            onClick={handleClearFilter}
            className="ml-3 text-slate-500 hover:text-slate-700 underline"
          >
            Clear filter
          </button>
        )}
      </div>
    </section>
  );
}
