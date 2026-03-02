import { Brain, FileText, LayoutDashboard, Mail, PlusCircle, Search, Settings, Stethoscope, Workflow } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import AIFloatingButton from '../ai/AIFloatingButton';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: Workflow },
  { to: '/candidates/new', label: 'Add Doctor', icon: PlusCircle },
  { to: '/email', label: 'Email Hub', icon: Mail },
  { to: '/outreach', label: 'Find Doctors', icon: Search },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/future-doctors', label: 'Future Doctors', icon: Stethoscope },
  { to: '/ai', label: 'AI Assistant', icon: Brain },
];

const navLinkBase = 'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl md:gap-6">
        <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-4 md:flex md:flex-col">
          <h1 className="mb-6 text-xl font-bold text-blue-700">Connie&apos;s Recruiting Hub</h1>
          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `${navLinkBase} ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'}`}>
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto">
            <div className="my-3 h-px bg-slate-200" />
            <NavLink to="/settings" className={({ isActive }) => `${navLinkBase} ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
            <p className="mt-3 text-xs text-slate-400">Powered by AI</p>
          </div>
        </aside>

        <main className="w-full flex-1 p-4 pb-24 md:p-8 md:pb-8"><Outlet /></main>
      </div>

      <AIFloatingButton />

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-9 gap-1">
          {[...navItems, { to: '/settings', label: 'Settings', icon: Settings }].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 py-1 text-xs font-medium ${isActive ? 'text-blue-700' : 'text-slate-600'}`}>
              <Icon size={18} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
