import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Candidate } from '../lib/database.types';
import { useToast } from '../components/shared/Toast';

type Report = {
  id: string;
  title: string;
  generated_at: string;
  content: string;
  report_type: string;
};

function formatDate(dateString?: string | null) {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-US');
}

function candidateLine(candidate: Candidate, details?: string) {
  const noteText = details?.trim() ? details.trim() : (candidate.notes?.trim() || 'No notes provided');
  return `- ${candidate.first_name} ${candidate.last_name} (${candidate.specialty}) — ${noteText}`;
}

function buildPipelineReport(candidates: Candidate[]) {
  const now = new Date();
  const today = new Date(now.toDateString());
  const reportDate = now.toLocaleDateString('en-US');

  const accepted = candidates.filter((c) => c.stage === 'Accepted');
  const offer = candidates.filter((c) => c.stage === 'Offer');
  const siteVisit = candidates.filter((c) => c.stage === 'Site Visit');
  const inProcess = candidates.filter((c) => c.stage === 'Phone Screen' || c.stage === 'Sourced');

  const recentSiteVisits = siteVisit.filter((c) => c.next_step_due && new Date(c.next_step_due) <= today);
  const upcomingSiteVisits = siteVisit.filter((c) => c.next_step_due && new Date(c.next_step_due) > today);
  const siteVisitToSchedule = siteVisit.filter((c) => !c.next_step_due);

  const groupedInProcess = inProcess.reduce<Record<string, Candidate[]>>((acc, candidate) => {
    const specialty = candidate.specialty || 'Unspecified Specialty';
    if (!acc[specialty]) acc[specialty] = [];
    acc[specialty].push(candidate);
    return acc;
  }, {});

  const inProcessLines = Object.entries(groupedInProcess)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([specialty, group]) => [
      `${specialty}:`,
      ...group.map((candidate) => `- ${candidate.first_name} ${candidate.last_name} (${candidate.stage})${candidate.notes ? ` — ${candidate.notes}` : ''}`),
      '',
    ]);

  const report = [
    `Physician Integration – Paducah Market ${reportDate}`,
    '',
    'Signed, yet to start:',
    ...(accepted.length
      ? accepted.map((candidate) => `- ${candidate.first_name} ${candidate.last_name} (${candidate.specialty}) — Start Date: ${formatDate(candidate.next_step_due)}`)
      : ['- None']),
    '',
    'Presented term sheet:',
    ...(offer.length ? offer.map((candidate) => candidateLine(candidate)) : ['- None']),
    '',
    'Recent site visits (in person and or zoom, no action taken yet):',
    ...(recentSiteVisits.length ? recentSiteVisits.map((candidate) => candidateLine(candidate)) : ['- None']),
    '',
    'Upcoming Site Visits:',
    ...(upcomingSiteVisits.length
      ? upcomingSiteVisits.map((candidate) => `- ${candidate.first_name} ${candidate.last_name} (${candidate.specialty}) — ${formatDate(candidate.next_step_due)}`)
      : ['- None']),
    '',
    'Site visit to be scheduled:',
    ...(siteVisitToSchedule.length ? siteVisitToSchedule.map((candidate) => candidateLine(candidate, 'No date set')) : ['- None']),
    '',
    'Candidates in Process:',
    ...(inProcessLines.length ? inProcessLines : ['- None']),
  ]
    .join('\n')
    .trim();

  return {
    title: `Physician Integration – Paducah Market ${reportDate}`,
    content: report,
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  const [loadingReports, setLoadingReports] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false });

    setLoadingReports(false);

    if (error) {
      if (error.code !== '42P01') {
        showToast('Could not load reports.', 'error');
      }
      setReports([]);
      return;
    }

    const loaded = (data ?? []) as Report[];
    setReports(loaded);

    if (!selectedReportId && loaded.length > 0) {
      setSelectedReportId(loaded[0].id);
      setReportText(loaded[0].content);
    }
  }, [selectedReportId, showToast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const copyText = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Report copied to clipboard.', 'success');
      } catch {
        showToast('Could not copy report.', 'error');
      }
    },
    [showToast],
  );

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    const { data: candidates, error: candidateError } = await supabase.from('candidates').select('*');

    if (candidateError) {
      setGenerating(false);
      showToast('Could not load candidates for report.', 'error');
      return;
    }

    const built = buildPipelineReport((candidates ?? []) as Candidate[]);

    const { data: inserted, error: insertError } = await supabase
      .from('reports')
      .insert({
        title: built.title,
        content: built.content,
        report_type: 'pipeline',
      })
      .select('*')
      .single();

    setGenerating(false);

    if (insertError) {
      setReportText(built.content);
      if (insertError.code === '42P01') {
        showToast('Report generated, but reports table does not exist yet. Run latest migration.', 'error');
      } else {
        showToast('Report generated, but could not save to history.', 'error');
      }
      return;
    }

    const saved = inserted as Report;
    setReports((prev) => [saved, ...prev]);
    setSelectedReportId(saved.id);
    setReportText(saved.content);
    showToast('Pipeline report generated and saved.', 'success');
  }, [showToast]);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-base text-slate-600">Generate Connie&apos;s bi-weekly physician integration report and copy it into the Baptist Health template.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">Report History</h2>
          {loadingReports ? <p className="text-sm text-slate-500">Loading reports...</p> : null}
          {!loadingReports && reports.length === 0 ? <p className="text-sm text-slate-500">No saved reports yet.</p> : null}
          <div className="space-y-2">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => {
                  setSelectedReportId(report.id);
                  setReportText(report.content);
                }}
                className={`w-full rounded-lg border p-3 text-left transition ${selectedReportId === report.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(report.generated_at)}</p>
              </button>
            ))}
          </div>
          {selectedReport ? (
            <button
              type="button"
              onClick={() => copyText(selectedReport.content)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Copy size={16} /> Copy to clipboard
            </button>
          ) : null}
        </aside>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Generate New Report</h2>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText size={16} /> {generating ? 'Generating...' : 'Generate Pipeline Report'}
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">
              {reportText || 'Click “Generate Pipeline Report” to create Connie\'s report.'}
            </pre>
          </div>

          {reportText ? (
            <button
              type="button"
              onClick={() => copyText(reportText)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Copy size={16} /> Copy to clipboard
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
