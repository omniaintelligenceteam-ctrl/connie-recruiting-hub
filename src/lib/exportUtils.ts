import type { Candidate } from './database.types';

const csv = (rows: Array<Array<string | number>>) => rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
const download = (data: string, name: string) => { const b = new Blob([data], { type: 'text/csv;charset=utf-8;' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u); };

export function exportCandidatesCSV(candidates: Candidate[]): void {
  const headers = ['Name', 'Specialty', 'Stage', 'Source', 'Email', 'Phone', 'Location', 'Current Employer', 'Next Step', 'Next Step Date', 'Created At'];
  const rows = candidates.map((c) => [`${c.first_name} ${c.last_name}`, c.specialty, c.stage, c.source ?? '', c.email ?? '', c.phone ?? '', c.current_location ?? '', c.current_employer ?? '', c.next_step ?? '', c.next_step_due ?? '', c.created_at]);
  download(csv([headers, ...rows]), `candidates-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportPipelineReport(candidates: Candidate[]): void {
  const grouped = candidates.reduce<Record<string, Candidate[]>>((acc, c) => { (acc[c.stage] ||= []).push(c); return acc; }, {});
  const rows = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([stage, items]) => [stage, items.length, items.map((c) => `Dr. ${c.first_name} ${c.last_name}`).join(' | ')]);
  download(csv([['Stage', 'Count', 'Candidate Names'], ...rows]), `pipeline-report-${new Date().toISOString().split('T')[0]}.csv`);
}
