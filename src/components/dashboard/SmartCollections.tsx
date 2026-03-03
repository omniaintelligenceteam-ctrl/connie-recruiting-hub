import { useMemo } from 'react';
import { 
  Globe, 
  Calendar, 
  FileCheck, 
  Star, 
  Users,
  Mail,
  AlertCircle,
  Briefcase,
  MapPin
} from 'lucide-react';
import type { Candidate } from '../../lib/database.types';
import { differenceInDays, parseISO } from 'date-fns';

interface SmartCollectionsProps {
  candidates: Candidate[];
  onSelectCollection: (filters: CollectionFilter) => void;
  activeCollection: string | null;
}

export interface CollectionFilter {
  id: string;
  label: string;
  predicate: (candidate: Candidate) => boolean;
}

interface CollectionCard {
  id: string;
  label: string;
  icon: typeof Users;
  count: number;
  color: string;
  description: string;
}

export default function SmartCollections({ candidates, onSelectCollection, activeCollection }: SmartCollectionsProps) {
  
  const collections: CollectionCard[] = useMemo(() => {
    const today = new Date();
    
    const getCount = (predicate: (c: Candidate) => boolean) => 
      candidates.filter(predicate).length;

    return [
      {
        id: 'overdue-followup',
        label: 'Overdue Follow-Ups',
        icon: AlertCircle,
        count: getCount(c => {
          if (!c.next_step_due) return false;
          const days = differenceInDays(today, parseISO(c.next_step_due));
          return days > 0;
        }),
        color: 'bg-red-50 text-red-600 border-red-100',
        description: 'Past due date'
      },
      {
        id: 'this-week-visits',
        label: 'This Week\'s Site Visits',
        icon: Calendar,
        count: getCount(c => {
          // Site visit stage candidates with visits scheduled this week
          if (c.stage !== 'Site Visit') return false;
          // Check if has upcoming visit in next 7 days
          // This would need site visit data; simplified for now
          return c.stage === 'Site Visit';
        }),
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        description: 'Scheduled visits'
      },
      {
        id: 'visa-pending',
        label: 'Visa Pending Approval',
        icon: Globe,
        count: getCount(c => 
          Boolean(c.is_visa_candidate) && 
          !c.approved_by_immigration && 
          c.visa_status !== 'Approved'
        ),
        color: 'bg-amber-50 text-amber-600 border-amber-100',
        description: 'Immigration review'
      },
      {
        id: 'ready-for-site-visit',
        label: 'Ready for Site Visit',
        icon: MapPin,
        count: getCount(c => 
          c.stage === 'Site Visit' && 
          c.approved_for_site_visit
        ),
        color: 'bg-blue-50 text-blue-600 border-blue-100',
        description: 'Approved & scheduled'
      },
      {
        id: 'offers-pending',
        label: 'Offers Pending',
        icon: Briefcase,
        count: getCount(c => c.stage === 'Offer'),
        color: 'bg-violet-50 text-violet-600 border-violet-100',
        description: 'Awaiting response'
      },
      {
        id: 'hot-leads',
        label: 'Hot Leads',
        icon: Star,
        count: getCount(c => {
          // High engagement - entered stage recently
          const daysInStage = differenceInDays(today, parseISO(c.stage_entered_at));
          return daysInStage <= 7 && c.stage !== 'Closed/Lost';
        }),
        color: 'bg-orange-50 text-orange-600 border-orange-100',
        description: 'Active this week'
      },
      {
        id: 'paperwork-due',
        label: 'Paperwork Due',
        icon: FileCheck,
        count: getCount(c => 
          Boolean(c.paperwork_sent_date) && 
          !c.paperwork_received_date
        ),
        color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
        description: 'Sent, not returned'
      },
      {
        id: 'email-ready',
        label: 'Ready for Outreach',
        icon: Mail,
        count: getCount(c => 
          c.stage === 'Sourced' && 
          Boolean(c.email)
        ),
        color: 'bg-slate-50 text-slate-600 border-slate-100',
        description: 'Has email, no contact'
      }
    ];
  }, [candidates]);

  const collectionFilters: CollectionFilter[] = useMemo(() => [
    {
      id: 'overdue-followup',
      label: 'Overdue Follow-Ups',
      predicate: (c) => {
        if (!c.next_step_due) return false;
        return differenceInDays(new Date(), parseISO(c.next_step_due)) > 0;
      }
    },
    {
      id: 'this-week-visits',
      label: 'This Week\'s Site Visits',
      predicate: (c) => c.stage === 'Site Visit'
    },
    {
      id: 'visa-pending',
      label: 'Visa Pending Approval',
      predicate: (c) => 
        Boolean(c.is_visa_candidate) && 
        !c.approved_by_immigration && 
        c.visa_status !== 'Approved'
    },
    {
      id: 'ready-for-site-visit',
      label: 'Ready for Site Visit',
      predicate: (c) => 
        c.stage === 'Site Visit' && 
        Boolean(c.approved_for_site_visit)
    },
    {
      id: 'offers-pending',
      label: 'Offers Pending',
      predicate: (c) => c.stage === 'Offer'
    },
    {
      id: 'hot-leads',
      label: 'Hot Leads',
      predicate: (c) => {
        const daysInStage = differenceInDays(new Date(), parseISO(c.stage_entered_at));
        return daysInStage <= 7 && c.stage !== 'Closed/Lost';
      }
    },
    {
      id: 'paperwork-due',
      label: 'Paperwork Due',
      predicate: (c) => 
        Boolean(c.paperwork_sent_date) && 
        !c.paperwork_received_date
    },
    {
      id: 'email-ready',
      label: 'Ready for Outreach',
      predicate: (c) => 
        c.stage === 'Sourced' && 
        !!c.email
    }
  ], []);

  const handleClick = (collection: CollectionCard) => {
    const filter = collectionFilters.find(f => f.id === collection.id);
    if (filter) {
      onSelectCollection(filter);
    }
  };

  const handleClear = () => {
    onSelectCollection({ id: 'all', label: 'All Candidates', predicate: () => true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-display font-bold text-slate-900">Smart Collections</h3>
          <p className="text-sm text-slate-500">Quick filters for your priorities</p>
        </div>
        
        {activeCollection && activeCollection !== 'all' && (
          <button
            onClick={handleClear}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {collections.map((collection) => {
          const Icon = collection.icon;
          const isActive = activeCollection === collection.id;
          
          return (
            <button
              key={collection.id}
              onClick={() => handleClick(collection)}
              className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
                isActive 
                  ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg' 
                  : 'hover:shadow-md hover:-translate-y-0.5'
              } ${collection.color}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${collection.color.split(' ')[0]}`}>
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <span className="text-2xl font-display font-bold">{collection.count}</span>
              </div>
              <p className="font-semibold text-sm leading-tight">{collection.label}</p>
              <p className="text-xs opacity-75 mt-1">{collection.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
