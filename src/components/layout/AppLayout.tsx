import { Brain, FileText, LayoutDashboard, Mail, PlusCircle, Search, Settings, Stethoscope, Workflow, Heart } from 'lucide-react';
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

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-screen w-[280px] md:flex md:flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Heart size={22} className="text-amber-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">Baptist Health</h1>
                  <p className="text-xs text-slate-300">Paducah</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Physician Recruitment</p>
            </div>

            <nav className="space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/10">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Settings size={20} strokeWidth={1.5} />
              <span>Settings</span>
            </NavLink>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-300">Welcome back, Connie</p>
            </div>
          </div>
        </aside>

        <main className="w-full flex-1 p-6 md:p-8 lg:p-10 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      <AIFloatingButton />

      <nav className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-slate-200 px-2 py-2 md:hidden shadow-2xl">
        <div className="mx-auto grid max-w-md grid-cols-9 gap-1">
          {[...navItems, { to: '/settings', label: 'Settings', icon: Settings }].map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-medium transition-all ${
                  isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-500'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
