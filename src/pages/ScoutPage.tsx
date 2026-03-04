import { useState } from 'react';
import { Search, Loader2, UserPlus, Radar, Phone, MapPin, Hash, Building2, AlertCircle, ChevronDown, Database, Briefcase } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const PLUGINS = [
  { id: 'npi', name: 'NPI Registry', icon: Database, desc: 'Physicians & providers (CMS)' },
  { id: 'jobboard', name: 'Job Boards', icon: Briefcase, desc: 'Indeed-style job listings' },
];

const SPECIALTIES = [
  'Cardiology', 'Family Medicine', 'Internal Medicine', 'Hospitalist', 'Emergency Medicine',
  'General Surgery', 'Orthopedic Surgery', 'Obstetrics & Gynecology', 'Pediatrics', 'Psychiatry',
  'Radiology', 'Anesthesiology', 'Neurology', 'Oncology', 'Urology', 'Dermatology'
];

interface ScoutResult {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  location: { city?: string; state?: string };
  contact: { phone?: string; email?: string; url?: string };
  metadata: Record<string, any>;
}

export default function ScoutPage() {
  const [plugin, setPlugin] = useState('npi');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [state, setState] = useState('AZ');
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScoutResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const selectedPlugin = PLUGINS.find(p => p.id === plugin);

  const runScout = async () => {
    setLoading(true);
    setError(null);
    setHasRun(true);

    try {
      const searchQuery = plugin === 'npi' ? specialty : query;
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plugin,
          query: searchQuery, 
          state,
          limit 
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Scout failed');
      setResults(data.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Radar size={22} className="text-primary-700" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Data Scout</h1>
            <p className="text-base text-slate-500">Universal structured data extractor</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Scout Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Data Source</label>
            <div className="relative">
              <select
                value={plugin}
                onChange={e => setPlugin(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none appearance-none bg-white"
              >
                {PLUGINS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-400">{selectedPlugin?.desc}</p>
          </div>

          {plugin === 'npi' ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Specialty</label>
              <input
                list="specialties"
                type="text"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none"
              />
              <datalist id="specialties">{SPECIALTIES.map(s => <option key={s} value={s} />)}</datalist>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Search Query</label>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="job title, skill, company..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">State/Location</label>
            <div className="relative">
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none appearance-none bg-white"
              >
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Limit</label>
            <div className="relative">
              <select
                value={limit}
                onChange={e => setLimit(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none appearance-none bg-white"
              >
                <option value={10}>10 results</option>
                <option value={25}>25 results</option>
                <option value={50}>50 results</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={runScout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Scouting...</> : <><Search size={16} /> Run Scout</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Scout failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && hasRun && !error && results.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <Radar size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="font-medium text-slate-600">No results found</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{results.length} Results</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 text-primary-700 font-bold text-sm">
                  {r.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <p className="font-medium text-slate-900 truncate">{r.name}</p>
                    {r.title && <p className="text-xs text-slate-500 truncate">{r.title}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{[r.location?.city, r.location?.state].filter(Boolean).join(', ')}</span>
                  </div>
                  {r.contact?.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={13} className="text-slate-400" />
                      <span>{r.contact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Hash size={12} />
                    <span className="font-mono">{r.id}</span>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100"
                >
                  <UserPlus size={13} /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
