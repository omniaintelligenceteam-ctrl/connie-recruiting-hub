import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Mail,
  Phone,
  Sparkles,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ActionType, Recommendation } from '../../lib/nextStepEngine';

// ─── Priority Config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    label: 'Action Required',
  },
  medium: {
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    icon: Clock,
    iconColor: 'text-amber-500',
    label: 'Due Soon',
  },
  low: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    icon: Info,
    iconColor: 'text-blue-400',
    label: 'Suggested',
  },
} as const;

// ─── Action Config ────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  ActionType,
  { label: string; icon: typeof Mail; buttonColor: string }
> = {
  send_outreach: {
    label: 'Send Outreach',
    icon: Mail,
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  schedule_followup_call: {
    label: 'Schedule Call',
    icon: Phone,
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  request_documents: {
    label: 'Request Docs',
    icon: FileText,
    buttonColor: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
  submit_to_client: {
    label: 'Submit to Client',
    icon: CheckCircle,
    buttonColor: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  interview_prep: {
    label: 'Open Prep Sheet',
    icon: Sparkles,
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  send_rejection: {
    label: 'Send Rejection',
    icon: X,
    buttonColor: 'bg-red-600 hover:bg-red-700 text-white',
  },
  nurture_touch: {
    label: 'Send Nurture Email',
    icon: Mail,
    buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  check_in: {
    label: 'Log Check-In',
    icon: Phone,
    buttonColor: 'bg-slate-600 hover:bg-slate-700 text-white',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface NextStepCardProps {
  recommendation: Recommendation;
  /** Called when the primary CTA button is clicked */
  onAction?: (action: ActionType, recommendation: Recommendation) => void;
  /** Called when the user dismisses the card */
  onDismiss?: () => void;
}

export default function NextStepCard({
  recommendation,
  onAction,
  onDismiss,
}: NextStepCardProps) {
  const [snoozed, setSnoozed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);

  const priorityCfg = PRIORITY_CONFIG[recommendation.priority];
  const actionCfg = ACTION_CONFIG[recommendation.action];
  const PriorityIcon = priorityCfg.icon;
  const ActionIcon = actionCfg.icon;

  const snoozeOptions = useMemo(
    () => [
      { label: '1 hour', ms: 60 * 60 * 1000 },
      { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
      { label: 'Tomorrow', ms: 24 * 60 * 60 * 1000 },
      { label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
    ],
    [],
  );

  if (dismissed) return null;

  if (snoozed) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        <BellOff size={16} />
        <span>Next-step suggestion snoozed.</span>
        <button
          type="button"
          className="ml-auto text-blue-600 hover:underline"
          onClick={() => setSnoozed(false)}
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative mb-4 rounded-xl border-2 ${priorityCfg.border} ${priorityCfg.bg} p-4 shadow-sm`}
    >
      {/* Dismiss button */}
      <button
        type="button"
        className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        aria-label="Dismiss suggestion"
      >
        <X size={14} />
      </button>

      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <PriorityIcon size={16} className={priorityCfg.iconColor} />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityCfg.badge}`}
        >
          {priorityCfg.label}
        </span>
      </div>

      {/* Message */}
      <p className="mb-1 text-sm font-semibold text-slate-800">{recommendation.message}</p>
      <p className="mb-4 text-xs text-slate-500">{recommendation.reason}</p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary CTA */}
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${actionCfg.buttonColor}`}
          onClick={() => onAction?.(recommendation.action, recommendation)}
        >
          <ActionIcon size={14} />
          {actionCfg.label}
          <ChevronRight size={14} />
        </button>

        {/* Snooze */}
        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            onClick={() => setSnoozeOpen((o) => !o)}
          >
            <Bell size={14} />
            Snooze
          </button>
          {snoozeOpen && (
            <div className="absolute left-0 z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white shadow-lg">
              {snoozeOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setSnoozed(true);
                    setSnoozeOpen(false);
                    // In a real app: persist snooze timestamp to localStorage/DB
                    const unsnoozAt = Date.now() + opt.ms;
                    setTimeout(() => {
                      if (Date.now() >= unsnoozAt) setSnoozed(false);
                    }, Math.min(opt.ms, 60_000)); // re-check after ≤1 min for demo
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
