import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: number;
  color: 'blue' | 'red' | 'green';
  icon: LucideIcon;
  onClick?: () => void;
};

const colorMap = {
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  green: 'bg-green-600 text-white',
};

export default function StatCard({ title, value, color, icon: Icon, onClick }: StatCardProps) {
  const classes = `w-full rounded-2xl p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorMap[color]}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        <div className="mb-4 flex items-start justify-between">
          <span className="text-4xl font-bold leading-none">{value}</span>
          <Icon size={24} />
        </div>
        <p className="text-sm font-medium opacity-95">{title}</p>
      </button>
    );
  }

  return (
    <div className={classes}>
      <div className="mb-4 flex items-start justify-between">
        <span className="text-4xl font-bold leading-none">{value}</span>
        <Icon size={24} />
      </div>
      <p className="text-sm font-medium opacity-95">{title}</p>
    </div>
  );
}
