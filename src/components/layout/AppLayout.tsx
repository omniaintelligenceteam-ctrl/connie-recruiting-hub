import { Brain, LayoutDashboard, PlusCircle, Radar, Settings, Workflow } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import AIFloatingButton from '../ai/AIFloatingButton';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-screen w-[280px] md:flex md:flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">Baptist Health</h1>
                  <p className="text-xs text-slate-300">Paducah</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Physician Recruitment</p>
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard size={20} strokeWidth={1.5} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/pipeline"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Workflow size={20} strokeWidth={1.5} />
                <span>Pipeline</span>
              </NavLink>
              <NavLink
                to="/candidates/new"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <PlusCircle size={20} strokeWidth={1.5} />
                <span>Add Doctor</span>
              </NavLink>
              <NavLink
                to="/ai"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Brain size={20} strokeWidth={1.5} />
                <span>AI Assistant</span>
              </NavLink>
              <NavLink
                to="/scout"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Radar size={20} strokeWidth={1.5} />
                <span>Scout</span>
              </NavLink>
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
        <main className="w-full flex-1 p-4 md:p-8 lg:p-10 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      <AIFloatingButton />
      <nav className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-slate-200 md:hidden shadow-xl">
        <div className="flex items-center justify-around h-16">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            <LayoutDashboard size={20} strokeWidth={1.5} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/pipeline" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            <Workflow size={20} strokeWidth={1.5} />
            <span>Pipeline</span>
          </NavLink>
          <NavLink to="/candidates/new" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            <PlusCircle size={24} strokeWidth={1.5} />
            <span>Add</span>
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            <Brain size={20} strokeWidth={1.5} />
            <span>AI</span>
          </NavLink>
          <NavLink to="/scout" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            <Radar size={20} strokeWidth={1.5} />
            <span>Scout</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            <Settings size={20} strokeWidth={1.5} />
            <span>More</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
