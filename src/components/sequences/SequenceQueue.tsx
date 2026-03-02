import { addDays, format, formatDistanceToNow, isFuture, isPast, isToday } from 'date-fns';
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Mail,
  Pause,
  Play,
  RefreshCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Candidate } from '../../lib/database.types';
import type { Sequence, SequenceStep } from '../../lib/sequences';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledStep extends SequenceStep {
  scheduledDate: Date;
  status: 'sent' | 'scheduled' | 'overdue' | 'skipped';
}

interface SequenceQueueProps {
  candidate: Candidate;
  sequence: Sequence;
  /** ISO date string for when the sequence was started */
  startedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(date: Date, paused: boolean): ScheduledStep['status'] {
  if (isPast(date) && !isToday(date)) return 'sent';
  if (paused && isFuture(date)) return 'skipped';
  return 'scheduled';
}

const STATUS_STYLE: Record<ScheduledStep['status'], string> = {
  sent: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  skipped: 'bg-slate-100 text-slate-500',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SequenceQueue({
  candidate,
  sequence,
  startedAt,
}: SequenceQueueProps) {
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(true);
  // Track custom date overrides: stepIndex → ISO string
  const [dateOverrides, setDateOverrides] = useState<Record<number, string>>({});
  const [previewStep, setPreviewStep] = useState<number | null>(null);

  const start = useMemo(() => new Date(startedAt), [startedAt]);

  const scheduledSteps = useMemo<ScheduledStep[]>(() => {
    return sequence.steps.map((step, idx) => {
      const baseDate = addDays(start, step.day);
      const override = dateOverrides[idx];
      const scheduledDate = override ? new Date(override) : baseDate;
      return {
        ...step,
        scheduledDate,
        status: getStatus(scheduledDate, paused),
      };
    });
  }, [sequence.steps, start, dateOverrides, paused]);

  const nextPending = scheduledSteps.find((s) => s.status === 'scheduled');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <CalendarClock size={18} className="text-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">{sequence.name}</p>
          <p className="text-xs text-slate-500">{sequence.description}</p>
        </div>

        {/* Pause / Resume */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            paused
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? 'Resume' : 'Pause'}
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="divide-y divide-slate-50">
          {scheduledSteps.map((step, idx) => (
            <div key={idx} className="px-4 py-3">
              {/* Step row */}
              <div className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className="mt-1 flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      step.status === 'sent'
                        ? 'bg-green-500'
                        : step.status === 'overdue'
                          ? 'bg-red-500'
                          : step.status === 'skipped'
                            ? 'bg-slate-300'
                            : 'bg-blue-500'
                    }`}
                  />
                  {idx < scheduledSteps.length - 1 && (
                    <div className="mt-1 h-8 w-px bg-slate-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-800">{step.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[step.status]}`}
                    >
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarClock size={11} />
                      {isToday(step.scheduledDate)
                        ? 'Today'
                        : format(step.scheduledDate, 'MMM d, yyyy')}
                    </span>
                    {isFuture(step.scheduledDate) && (
                      <span className="text-slate-400">
                        ({formatDistanceToNow(step.scheduledDate, { addSuffix: true })})
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail size={11} />
                      {step.template}
                    </span>
                  </div>

                  {/* Date edit input */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="date"
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={
                        dateOverrides[idx] ??
                        format(step.scheduledDate, 'yyyy-MM-dd')
                      }
                      onChange={(e) => {
                        setDateOverrides((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }));
                      }}
                    />
                    {dateOverrides[idx] && (
                      <button
                        type="button"
                        className="text-xs text-slate-400 hover:text-slate-700"
                        onClick={() => {
                          setDateOverrides((prev) => {
                            const next = { ...prev };
                            delete next[idx];
                            return next;
                          });
                        }}
                        title="Reset to default"
                      >
                        <RefreshCcw size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => setPreviewStep(previewStep === idx ? null : idx)}
                    >
                      {previewStep === idx ? 'Hide preview' : 'Preview email'}
                    </button>
                  </div>

                  {/* Email preview */}
                  {previewStep === idx && (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700 mb-1">
                        Template:{' '}
                        <span className="font-mono">{step.template}</span>
                      </p>
                      <p className="text-slate-500">
                        Sending to:{' '}
                        <span className="font-medium text-slate-700">
                          Dr. {candidate.first_name} {candidate.last_name}
                        </span>{' '}
                        {candidate.email ? `<${candidate.email}>` : '(no email on file)'}
                      </p>
                      <p className="mt-1 text-slate-400 italic">
                        Full template content shown in Email Composer.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {nextPending && (
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          Next send:{' '}
          <span className="font-semibold text-slate-700">
            {nextPending.label}
          </span>{' '}
          on{' '}
          <span className="font-semibold text-blue-600">
            {format(nextPending.scheduledDate, 'MMMM d')}
          </span>
        </div>
      )}
    </div>
  );
}
