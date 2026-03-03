import { Brain, FileText, LayoutDashboard, Mail, MoreHorizontal, PlusCircle, Search, Settings, Stethoscope, Workflow, Heart, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
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
  { to: '/settings', label: 'Settings', icon: Settings },
];

// Primary 4 tabs shown always on mobile
const primaryNav = navItems.slice(0, 4);
// The rest go in the "More" drawer
const moreNav = navItems.slice(4);

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex max-w-[1600px]">
        {/* Sidebar — desktop only */}
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
            <div className="pt-2">
              <p className="text-xs text-slate-300">Welcome back, Connie</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="w-full flex-1 p-4 md:p-8 lg:p-10 pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>

      <AIFloatingButton />

      {/* Mobile "More" drawer backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Mobile "More" drawer — slides up */}
      <div
        className={`fixed inset-x-0 bottom-[65px] z-40 md:hidden bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 transition-transform duration-300 ${
          moreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">More</p>
          <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {moreNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-2 p-4 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-center leading-tight">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile bottom nav — 4 primary + More */}
      <nav className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-slate-200 md:hidden shadow-xl">
        <div className="flex items-stretch h-16">
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-all ${
                  isActive ? 'text-blue-700' : 'text-slate-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(prev => !prev)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-all ${
              moreOpen ? 'text-blue-700' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${moreOpen ? 'bg-blue-50' : ''}`}>
              <MoreHorizontal size={20} strokeWidth={1.5} />
            </div>
            <span>More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
