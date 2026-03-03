import { Briefcase, Filter, Search } from 'lucide-react';
import PipelineBoard from '../components/pipeline/PipelineBoard';

export default function PipelinePage() {
  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Briefcase size={22} className="text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900">Recruiting Pipeline</h1>
              <p className="text-base text-slate-500">Track candidates through each stage</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all w-64"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </header>

      <div className="bg-slate-50/50 -mx-6 px-6 py-6">
        <PipelineBoard />
      </div>
    </section>
  );
}
