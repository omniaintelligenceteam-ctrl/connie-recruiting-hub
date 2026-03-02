import { format, isBefore, isSameWeek, isToday, parseISO } from 'date-fns';
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Mail,
  Phone,
  PhoneCall,
  Sparkles,
  Timer,
  Workflow,
} from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates } from '../../hooks/useCandidates';
import { recommendNextStep } from '../../lib/nextStepEngine';
import type { Candidate } from '../../lib/database.types';

type DigestItem = { id: string; label: string };
type DigestRow = {
  key: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  count: number;
  items: DigestItem[];
  actionLabel?: string;
  urgent?: boolean;
};

const fullName = (c: Candidate) => `Dr. ${c.first_name} ${c.last_name}`;

export default function DailyDigest() {
  const { candidates, loading } = useCandidates();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows = useMemo<DigestRow[]>(() => {
    const now = new Date();

    // ── Existing smart filters ────────────────────────────────────────────────
    const dueToday = candidates.filter(
      (c) => c.next_step_due && isToday(parseISO(c.next_step_due)),
    );

    const overdue = candidates
      .filter(
        (c) =>
          c.next_step_due &&
          isBefore(parseISO(c.next_step_due), now) &&
          !isToday(parseISO(c.next_step_due)),
      )
      .map((c) => {
        const due = parseISO(c.next_step_due as string);
        const days = Math.max(1, Math.floor((now.getTime() - due.getTime()) / 86400000));
        return { id: c.id, label: `${fullName(c)} — ${days} day${days === 1 ? '' : 's'} overdue` };
      });

    const siteVisits = candidates
      .filter(
        (c) =>
          c.stage === 'Site Visit' &&
          isSameWeek(parseISO(c.stage_entered_at), now, { weekStartsOn: 1 }),
      )
      .map((c) => ({
        id: c.id,
        label: `${fullName(c)} — ${format(parseISO(c.stage_entered_at), 'EEE, MMM d')}`,
      }));

    const newThisWeek = candidates.filter((c) =>
      isSameWeek(parseISO(c.created_at), now, { weekStartsOn: 1 }),
    );

    const pipeline = candidates.filter((c) => !['Accepted', 'Closed/Lost'].includes(c.stage));
    const stages = new Set(pipeline.map((c) => c.stage)).size;

    // ── NEW: Next-Step Engine summaries ───────────────────────────────────────
    // We run the engine with empty interactions (lightweight — no DB call here)
    // so we can get rough counts. Production upgrade: fetch all interactions.
    const needsOutreach = candidates.filter((c) => {
      if (c.stage !== 'Sourced' && c.stage !== 'Contacted') return false;
      const rec = recommendNextStep(c, [], now);
      return rec?.action === 'send_outreach';
    });

    const needsCall = candidates.filter((c) => {
      if (c.stage !== 'Contacted' && c.stage !== 'Responded') return false;
      const rec = recommendNextStep(c, [], now);
      return rec?.action === 'schedule_followup_call';
    });

    const prepTomorrow = candidates.filter((c) => {
      if (c.stage !== 'Site Visit') return false;
      if (!c.next_step_due) return false;
      const rec = recommendNextStep(c, [], now);
      return rec?.action === 'interview_prep';
    });

    return [
      {
        key: 'due-today',
        icon: PhoneCall,
        label: 'Follow-ups due today',
        count: dueToday.length,
        items: dueToday.map((c) => ({ id: c.id, label: fullName(c) })),
      },
      {
        key: 'overdue',
        icon: Timer,
        label: 'Overdue follow-ups',
        count: overdue.length,
        items: overdue,
        urgent: overdue.length > 0,
      },
      {
        key: 'needs-outreach',
        icon: Mail,
        label:
          needsOutreach.length === 1
            ? '1 candidate needs outreach today'
            : `${needsOutreach.length} candidates need outreach today`,
        count: needsOutreach.length,
        items: needsOutreach.map((c) => ({
          id: c.id,
          label: `${fullName(c)} — ${c.stage}`,
        })),
        actionLabel: 'Send Outreach',
        urgent: needsOutreach.length > 0,
      },
      {
        key: 'needs-call',
        icon: Phone,
        label:
          needsCall.length === 1
            ? '1 follow-up call overdue'
            : `${needsCall.length} follow-up calls overdue`,
        count: needsCall.length,
        items: needsCall.map((c) => ({
          id: c.id,
          label: `${fullName(c)} — no reply in 3+ days`,
        })),
        urgent: needsCall.length > 0,
      },
      {
        key: 'prep-tomorrow',
        icon: AlertCircle,
        label:
          prepTomorrow.length === 1
            ? '1 interview to prep for tomorrow'
            : `${prepTomorrow.length} interviews to prep for tomorrow`,
        count: prepTomorrow.length,
        items: prepTomorrow.map((c) => ({
          id: c.id,
          label: `${fullName(c)} — site visit tomorrow`,
        })),
        urgent: prepTomorrow.length > 0,
      },
      {
        key: 'site-visits',
        icon: CalendarDays,
        label: 'Site visits this week',
        count: siteVisits.length,
        items: siteVisits,
      },
      {
        key: 'new',
        icon: Sparkles,
        label: 'New candidates this week',
        count: newThisWeek.length,
        items: [],
      },
      {
        key: 'pipeline',
        icon: Workflow,
        label: `Pipeline total: ${pipeline.length} across ${stages} stage${stages === 1 ? '' : 's'}`,
        count: pipeline.length,
        items: [],
      },
    ];
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
            <div
              key={row.key}
              className={`rounded-xl border ${
                row.urgent && row.count > 0
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  hasItems &&
                  setExpandedRows((p) => ({ ...p, [row.key]: !p[row.key] }))
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <Icon
                  size={18}
                  className={row.urgent && row.count > 0 ? 'text-red-500' : 'text-blue-600'}
                />
                <p className="flex-1 text-sm text-slate-700">{row.label}</p>
                <span
                  className={`inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                    row.urgent && row.count > 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {row.count}
                </span>
                {hasItems ? (
                  open ? (
                    <ChevronUp size={16} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500" />
                  )
                ) : null}
              </button>

              {hasItems && open ? (
                <div className="border-t border-slate-100 px-4 py-3">
                  <ul className="space-y-2 text-sm text-slate-600">
                    {row.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <ChevronRight size={14} className="shrink-0 text-slate-400" />
                        <Link
                          className="text-blue-700 hover:underline"
                          to={`/candidates/${item.id}`}
                        >
                          {item.label}
                        </Link>
                      </li>
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
