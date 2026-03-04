import { useState } from 'react';
import { Search, Loader2, UserPlus, Radar, Phone, MapPin, Hash, Building2, AlertCircle, ChevronDown } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const SPECIALTIES = [
  'Cardiology', 'Family Medicine', 'Internal Medicine', 'Hospitalist',
  'Emergency Medicine', 'General Surgery', 'Orthopedic Surgery',
  'Obstetrics & Gynecology', 'Pediatrics', 'Psychiatry',
  'Radiology', 'Anesthesiology', 'Neurology', 'Oncology',
  'Urology', 'Dermatology', 'Gastroenterology', 'Pulmonology',
  'Nephrology', 'Endocrinology'
];

interface Physician {
  name: string;
  npi: string;
  specialty: string;
  city: string;
  state: string;
  phone: string;
  organization: string;
}

export default function ScoutPage() {
  const [specialty, setSpecialty] = useState('Cardiology');
  const [state, setState] = useState('AZ');
  const [limit, setLimit] = useState(10);
  const [results, setResults] = useState<Physician[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [addedNPIs, setAddedNPIs] = useState<Set<string>>(new Set());

  const runScout = async () => {
    setLoading(true);
    setError(null);
    setHasRun(true);

    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, state, limit }),
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

  const handleAddToPipeline = (physician: Physician) => {
    setAddedNPIs(prev => new Set([...prev, physician.npi]));
    const params = new URLSearchParams({
      name: physician.name,
      specialty: physician.specialty,
      npi: physician.npi,
      phone: physician.phone,
      city: physician.city,
      state: physician.state,
      organization: physician.organization,
    });
    window.open('/candidates/new?' + params.toString(), '_blank');
  };

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Radar size={22} className="text-primary-700" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Physician Scout</h1>
            <p className="text-base text-slate-500">Find physicians by specialty + location via NPI Registry</p>
          </div>
        </div>
        {results.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {results.length} physicians found
          </div>
        )}
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Search Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Specialty</label>
            <input
              list="specialties"
              type="text"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              placeholder="e.g. Cardiology"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none transition-all"
            />
            <datalist id="specialties">
              {SPECIALTIES.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">State</label>
            <div className="relative">
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none transition-all appearance-none bg-white"
              >
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Results</label>
            <div className="relative">
              <select
                value={limit}
                onChange={e => setLimit(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary-500 outline-none transition-all appearance-none bg-white"
              >
                <option value={10}>10 results</option>
                <option value={25}>25 results</option>
                <option value={50}>50 results</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={runScout}
            disabled={loading || !specialty.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Scouting...</>
            ) : (
              <><Search size={16} /> Run Scout</>
            )}
          </button>
          <p className="mt-2 text-xs text-slate-400">Live data from CMS NPI Registry — free, no API key required</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Scout failed</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {!loading && hasRun && !error && results.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <Radar size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="font-medium text-slate-600">No physicians found</p>
          <p className="text-sm text-slate-400 mt-1">Try a different specialty or state</p>
        </div>
      )}

      {!hasRun && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <Search size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="font-medium text-slate-600">Configure and run a scout</p>
          <p className="text-sm text-slate-400 mt-1">Results pulled live from the NPI Registry</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{results.length} Physicians Found</h2>
            <span className="text-xs text-slate-400">{specialty} · {state}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {results.map((p, i) => (
              <div key={p.npi || i} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 text-primary-700 font-bold text-sm">
                  {p.name ? p.name.charAt(0) : '?'}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-4">
                  <div>
                    <p className="font-medium text-slate-900 truncate">{p.name || '—'}</p>
                    <p className="text-xs text-slate-500 truncate">{p.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{[p.city, p.state].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{p.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Hash size={12} className="shrink-0" />
                    <span className="font-mono">{p.npi}</span>
                  </div>
                </div>
                {p.organization && (
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 max-w-[160px]">
                    <Building2 size={12} className="shrink-0 text-slate-400" />
                    <span className="truncate">{p.organization}</span>
                  </div>
                )}
                <button
                  onClick={() => handleAddToPipeline(p)}
                  disabled={addedNPIs.has(p.npi)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    addedNPIs.has(p.npi)
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                      : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
                  }`}
                >
                  <UserPlus size={13} />
                  {addedNPIs.has(p.npi) ? 'Added' : 'Add to Pipeline'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
