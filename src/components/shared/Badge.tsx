type BadgeProps = {
  label: string;
  colorClass?: string;
};

export default function Badge({ label, colorClass = 'bg-slate-100 text-slate-700' }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border border-transparent px-3 py-1 text-sm font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
