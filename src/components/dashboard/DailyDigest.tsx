import { format, isBefore, isSameWeek, isToday, parseISO } from 'date-fns';
import { CalendarDays, ChevronDown, ChevronUp, PhoneCall, Sparkles, Timer, Workflow } from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates } from '../../hooks/useCandidates';
import type { Candidate } from '../../lib/database.types';

type DigestRow = { key: string; icon: ComponentType<{ size?: number; className?: string }>; label: string; count: number; items: Array<{ id: string; label: string }>; };
const fullName = (c: Candidate) => `Dr. ${c.first_name} ${c.last_name}`;

export default function DailyDigest() {
  const { candidates, loading } = useCandidates();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    const now = new Date();
    const dueToday = candidates.filter((c) => c.next_step_due && isToday(parseISO(c.next_step_due)));
    const overdue = candidates.filter((c) => c.next_step_due && isBefore(parseISO(c.next_step_due), now) && !isToday(parseISO(c.next_step_due))).map((c) => {
      const due = parseISO(c.next_step_due as string);
      const days = Math.max(1, Math.floor((now.getTime() - due.getTime()) / 86400000));
      return { id: c.id, label: `${fullName(c)} — ${days} day${days === 1 ? '' : 's'} overdue` };
    });
    const siteVisits = candidates.filter((c) => c.stage === 'Site Visit' && isSameWeek(parseISO(c.stage_entered_at), now, { weekStartsOn: 1 })).map((c) => ({ id: c.id, label: `${fullName(c)} — ${format(parseISO(c.stage_entered_at), 'EEE, MMM d')}` }));
    const newThisWeek = candidates.filter((c) => isSameWeek(parseISO(c.created_at), now, { weekStartsOn: 1 }));
    const pipeline = candidates.filter((c) => !['Accepted', 'Closed/Lost'].includes(c.stage));
    const stages = new Set(pipeline.map((c) => c.stage)).size;

    return [
      { key: 'due-today', icon: PhoneCall, label: 'Follow-ups due today', count: dueToday.length, items: dueToday.map((c) => ({ id: c.id, label: fullName(c) })) },
      { key: 'overdue', icon: Timer, label: 'Overdue follow-ups', count: overdue.length, items: overdue },
      { key: 'site-visits', icon: CalendarDays, label: 'Site visits this week', count: siteVisits.length, items: siteVisits },
      { key: 'new', icon: Sparkles, label: 'New candidates this week', count: newThisWeek.length, items: [] },
      { key: 'pipeline', icon: Workflow, label: `Pipeline total: ${pipeline.length} across ${stages} stage${stages === 1 ? '' : 's'}`, count: pipeline.length, items: [] },
    ] as DigestRow[];
  }, [candidates]);

  return (
    <section className="rounded-2xl border-l-4 border-l-blue-400 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">Your Day at a Glance</h3>
      {loading ? <p className="mt-2 text-sm text-slate-500">Loading digest...</p> : null}
      <div className="mt-4 space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          const open = expandedRows[row.key];
          const hasItems = row.items.length > 0;
          return (
            <div key={row.key} className="rounded-xl border border-slate-200">
              <button type="button" onClick={() => hasItems && setExpandedRows((p) => ({ ...p, [row.key]: !p[row.key] }))} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <Icon size={18} className="text-blue-600" />
                <p className="flex-1 text-sm text-slate-700">{row.label}</p>
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{row.count}</span>
                {hasItems ? open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" /> : null}
              </button>
              {hasItems && open ? (
                <div className="border-t border-slate-100 px-4 py-3">
                  <ul className="space-y-2 text-sm text-slate-600">
                    {row.items.map((item) => (
                      <li key={item.id}><Link className="text-blue-700 hover:underline" to={`/candidates/${item.id}`}>{item.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
