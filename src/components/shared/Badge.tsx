type BadgeProps = {
  label: string;
  colorClass?: string;
  variant?: 'specialty' | 'stage';
};

export default function Badge({
  label,
  colorClass = 'bg-slate-100 text-slate-700',
  variant = 'specialty',
}: BadgeProps) {
  const shape = variant === 'stage' ? 'rounded-md px-2 py-0.5 text-xs font-semibold' : 'rounded-full px-2.5 py-0.5 text-xs font-medium';

  return <span className={`inline-flex items-center border border-transparent ${shape} ${colorClass}`}>{label}</span>;
}
