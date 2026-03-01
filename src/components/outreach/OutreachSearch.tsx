import {
  BriefcaseMedical,
  ExternalLink,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCandidates } from '../../hooks/useCandidates';
import { type OutreachResult, useOutreachSearch } from '../../hooks/useOutreachSearch';
import { SPECIALTIES } from '../../lib/constants';
import type { InsertCandidate } from '../../lib/database.types';
import { useToast } from '../shared/Toast';

type QuickSearch = {
  title: string;
  specialty: string;
  location: string;
  requirements: string;
  icon: typeof Sparkles;
};

const quickSearches: QuickSearch[] = [
  {
    title: 'GI fellows completing 2026',
    specialty: 'Gastroenterology',
    location: '',
    requirements: 'Completing fellowship in 2026',
    icon: GraduationCap,
  },
  {
    title: 'Neurologists in the Southeast',
    specialty: 'Neurology',
    location: 'Southeast',
    requirements: '',
    icon: MapPin,
  },
  {
    title: 'OB/GYN open to rural practice',
    specialty: 'OB/GYN',
    location: 'Rural communities',
    requirements: 'Open to rural practice opportunities',
    icon: Stethoscope,
  },
  {
    title: 'Cardiothoracic surgeons',
    specialty: 'Cardiothoracic Surgery',
    location: '',
    requirements: '',
    icon: BriefcaseMedical,
  },
  {
    title: 'Hematology/Oncology - Kentucky region',
    specialty: 'Hematology/Oncology',
    location: 'Kentucky region',
    requirements: '',
    icon: MapPin,
  },
];

export default function OutreachSearch() {
  const { addCandidate } = useCandidates();
  const { showToast } = useToast();
  const { searchResults, loading, error, search, clearResults } = useOutreachSearch();

  const [specialty, setSpecialty] = useState<string>('');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [addingName, setAddingName] = useState<string | null>(null);

  const specialtyOptions = useMemo(() => Array.from(new Set([...SPECIALTIES, 'Other'])), []);

  const runSearch = async () => {
    if (!specialty.trim()) {
      showToast('Please choose a specialty before searching.', 'error');
      return;
    }

    try {
      const response = await search(specialty, location.trim(), requirements.trim());
      setSearchMessage(response.message);
      setHasSearched(true);
      showToast('Search completed. Review results below.', 'success');
    } catch {
      setHasSearched(true);
      showToast('Search failed. Please try again.', 'error');
    }
  };

  const applyQuickSearch = (item: QuickSearch) => {
    setSpecialty(item.specialty);
    setLocation(item.location);
    setRequirements(item.requirements);
    showToast(`Loaded quick search: ${item.title}`, 'info');
  };

  const toCandidatePayload = (result: OutreachResult): InsertCandidate => {
    const fullName = result.name.startsWith('Dr. ') ? result.name.replace('Dr. ', '') : result.name;
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? 'Unknown';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Doctor';

    return {
      first_name: firstName,
      last_name: lastName,
      specialty: result.specialty || specialty || 'Other',
      stage: 'Sourced',
      email: result.email ?? null,
      phone: result.phone ?? null,
      current_location: result.location || null,
      current_employer: result.position || null,
      source: 'Cold Outreach',
      notes: `Sourced from outreach search. Source: ${result.source}${result.sourceUrl ? ` (${result.sourceUrl})` : ''}`,
      next_step: 'Send outreach email',
      next_step_due: new Date().toISOString().split('T')[0],
      lost_reason: null,
      stage_entered_at: new Date().toISOString(),
    };
  };

  const handleAddToPipeline = async (result: OutreachResult) => {
    setAddingName(result.name);
    try {
      await addCandidate(toCandidatePayload(result));
      showToast(`Added ${result.name} to pipeline as Sourced.`, 'success');
    } catch {
      showToast('Could not add candidate to pipeline.', 'error');
    } finally {
      setAddingName(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm md:p-7">
        <h2 className="text-3xl font-bold text-slate-900">Find Doctors</h2>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          Tell me what kind of physician you need and I&apos;ll search for candidates
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2 text-base font-medium text-slate-700">
            Specialty <span className="text-red-500">*</span>
            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base"
            >
              <option value="">Select specialty...</option>
              {specialtyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-base font-medium text-slate-700">
            Location preference (optional)
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Kentucky, Southeast, willing to relocate"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-base font-medium text-slate-700">
          Additional requirements (optional)
          <textarea
            rows={3}
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            placeholder="e.g. completing fellowship 2026, board certified, specific subspecialty"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base"
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runSearch}
            disabled={loading}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 text-base font-bold text-white shadow-md transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
          {hasSearched ? (
            <button
              type="button"
              onClick={() => {
                clearResults();
                setHasSearched(false);
                setSearchMessage('');
              }}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear results
            </button>
          ) : null}
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Quick searches</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickSearches.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => applyQuickSearch(item)}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="mb-2 inline-flex rounded-lg bg-white p-2 text-blue-600 shadow-sm group-hover:bg-blue-100">
                  <Icon size={16} />
                </div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Results</h3>

        {!hasSearched && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Search size={30} />
            </div>
            <p className="text-lg font-semibold text-slate-900">Search for your next great physician candidate</p>
            <p className="mt-2 text-base text-slate-600">
              Choose a specialty, add preferences, and run a search to build your outreach pipeline faster.
            </p>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 text-blue-700">
              <Loader2 size={18} className="animate-spin" />
              <p className="font-semibold">Searching medical directories, fellowship programs, and physician databases...</p>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-xl border border-slate-200 p-4">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {!loading && hasSearched && searchMessage && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">{searchMessage}</div>
        )}

        {!loading && hasSearched && !error && searchResults.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
            No matches found yet. Try broadening your location or requirements.
          </div>
        )}

        {!loading &&
          searchResults.map((result) => (
            <article key={`${result.name}-${result.sourceUrl}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-900">
                    {result.name.startsWith('Dr.') ? result.name : `Dr. ${result.name}`}
                  </h4>
                  <p className="text-base text-slate-700">{result.position}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{result.location}</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                      {result.specialty || specialty || 'Specialty not listed'}
                    </span>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">{result.source}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
                    {result.email ? (
                      <span className="inline-flex items-center gap-1">
                        <Mail size={14} /> {result.email}
                      </span>
                    ) : null}
                    {result.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={14} /> {result.phone}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 md:flex-col md:items-end">
                  <button
                    type="button"
                    onClick={() => handleAddToPipeline(result)}
                    disabled={addingName === result.name}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                  >
                    <UserPlus size={16} />
                    {addingName === result.name ? 'Adding...' : 'Add to Pipeline'}
                  </button>
                  <a
                    href={result.sourceUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Source <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </article>
          ))}
      </section>
    </section>
  );
}
