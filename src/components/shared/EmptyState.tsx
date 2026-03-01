import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: LucideIcon;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Icon size={28} />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mb-6 max-w-md text-base text-slate-600">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="min-h-11 rounded-lg bg-blue-600 px-6 text-base font-semibold text-white transition hover:bg-blue-700"
      >
        {actionLabel}
      </button>
    </div>
  );
}
