import { useMemo } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Calendar,
  Globe,
  Shield,
  MessageSquare,
  Plane,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { Candidate } from '../../lib/database.types';
import { differenceInDays, parseISO } from 'date-fns';

interface ActionBasedViewsProps {
  candidates: Candidate[];
  onViewAction: (actionType: string, candidateIds: string[]) => void;
}

interface ActionView {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  count: number;
  urgent: boolean;
  candidateIds: string[];
  color: string;
}

export default function ActionBasedViews({ candidates, onViewAction }: ActionBasedViewsProps) {
  
  const actionViews: ActionView[] = useMemo(() => {
    const today = new Date();
    
    const views: ActionView[] = [
      {
        id: 'prep-sheets-due',
        title: 'Prep Sheets to Send',
        description: 'Site Visit stage - no prep sheet sent yet',
        icon: FileText,
        count: 0,
        urgent: false,
        candidateIds: [],
        color: 'bg-violet-50 text-violet-600 border-violet-100'
      },
      {
        id: 'paperwork-pending',
        title: 'Paperwork Pending',
        description: 'Forms sent, awaiting return',
        icon: Clock,
        count: 0,
        urgent: true,
        candidateIds: [],
        color: 'bg-amber-50 text-amber-600 border-amber-100'
      },
      {
        id: 'npdb-ordered',
        title: 'NPDB Checks to Order',
        description: 'Candidates needing background check',
        icon: Shield,
        count: 0,
        urgent: false,
        candidateIds: [],
        color: 'bg-blue-50 text-blue-600 border-blue-100'
      },
      {
        id: 'thank-you-due',
        title: 'Thank You Letters Due',
        description: 'Post-site visit follow-ups',
        icon: MessageSquare,
        count: 0,
        urgent: true,
        candidateIds: [],
        color: 'bg-pink-50 text-pink-600 border-pink-100'
      },
      {
        id: 'visa-followup',
        title: 'Visa Status Follow-Up',
        description: 'Check status with immigration lawyer',
        icon: Globe,
        count: 0,
        urgent: false,
        candidateIds: [],
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
      },
      {
        id: 'offers-to-send',
        title: 'Offers to Send',
        description: 'Approved candidates awaiting offer',
        icon: Send,
        count: 0,
        urgent: true,
        candidateIds: [],
        color: 'bg-red-50 text-red-600 border-red-100'
      },
      {
        id: 'interviews-schedule',
        title: 'Interviews to Schedule',
        description: 'Candidates awaiting site visit date',
        icon: Calendar,
        count: 0,
        urgent: false,
        candidateIds: [],
        color: 'bg-cyan-50 text-cyan-600 border-cyan-100'
      },
      {
        id: 'travel-to-book',
        title: 'Travel to Book',
        description: 'Confirmed site visits needing flights/hotels',
        icon: Plane,
        count: 0,
        urgent: false,
        candidateIds: [],
        color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
      }
    ];

    // Calculate counts based on candidate data
    candidates.forEach(candidate => {
      // Prep sheets due - Site Visit stage
      if (candidate.stage === 'Site Visit') {
        views[0].candidateIds.push(candidate.id);
        views[0].count++;
      }

      // Paperwork pending
      if (candidate.paperwork_sent_date && !candidate.paperwork_received_date) {
        views[1].candidateIds.push(candidate.id);
        views[1].count++;
        // Mark urgent if sent more than 7 days ago
        const daysSinceSent = candidate.paperwork_sent_date 
          ? differenceInDays(today, parseISO(candidate.paperwork_sent_date))
          : 0;
        if (daysSinceSent > 7) views[1].urgent = true;
      }

      // NPDB checks needed
      if (!candidate.npdb_status && candidate.stage !== 'Sourced') {
        views[2].candidateIds.push(candidate.id);
        views[2].count++;
      }

      // Thank you letters due - after site visit completion
      if (candidate.stage === 'Offer' || candidate.stage === 'Accepted') {
        // This is simplified; would need thank_you_letters table check
        // views[3].candidateIds.push(candidate.id);
        // views[3].count++;
      }

      // Visa follow-up
      if (candidate.is_visa_candidate && 
          candidate.visa_status === 'Pending Lawyer Review') {
        views[4].candidateIds.push(candidate.id);
        views[4].count++;
      }

      // Offers to send
      if (candidate.stage === 'Offer') {
        views[5].candidateIds.push(candidate.id);
        views[5].count++;
      }

      // Interviews to schedule
      if (candidate.stage === 'Phone Screen' && 
          !candidate.next_step?.toLowerCase().includes('site visit scheduled')) {
        views[6].candidateIds.push(candidate.id);
        views[6].count++;
      }

      // Travel to book - approved for site visit
      if (candidate.stage === 'Site Visit' && 
          candidate.approved_for_site_visit) {
        views[7].candidateIds.push(candidate.id);
        views[7].count++;
      }
    });

    return views.filter(v => v.count > 0);
  }, [candidates]);

  const handleClick = (view: ActionView) => {
    onViewAction(view.id, view.candidateIds);
  };

  if (actionViews.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <p className="text-lg font-medium text-slate-900">All caught up!</p>
        <p className="text-sm text-slate-500 mt-1">No pending action items right now.</p>
      </div>
    );
  }

  // Split into urgent and normal
  const urgentViews = actionViews.filter(v => v.urgent);
  const normalViews = actionViews.filter(v => !v.urgent);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-display font-bold text-slate-900">Action-Based Views</h3>
        <p className="text-sm text-slate-500">
          Organized by what needs your attention
        </p>
      </div>

      {/* Urgent Section */}
      {urgentViews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Urgent</h4>
          </div>
          
          <div className="grid gap-3">
            {urgentViews.map(view => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => handleClick(view)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-red-200 bg-red-50/50 text-left transition-all hover:shadow-md hover:bg-red-50"
                >
                  <div className="p-3 rounded-xl bg-red-100 text-red-600">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{view.title}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        {view.count}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{view.description}</p>
                  </div>
                  
                  <ArrowRight size={18} className="text-red-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal Section */}
      <div className="grid gap-3">
        {urgentViews.length > 0 && normalViews.length > 0 && (
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide pt-2">Up Next</h4>
        )}
        
        {normalViews.map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => handleClick(view)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${view.color}`}
            >
              <div className={`p-3 rounded-xl ${view.color.split(' ')[0]}`}>
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{view.title}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/50 text-xs font-bold">
                    {view.count}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{view.description}</p>
              </div>
              
              <ArrowRight size={18} className="text-slate-400 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
