import { addDays, formatISO, isBefore, isToday, parseISO } from 'date-fns';
import { CheckSquare, Copy, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCandidates } from '../../hooks/useCandidates';
import { useInteractions } from '../../hooks/useInteractions';
import type { Candidate } from '../../lib/database.types';
import { useToast } from '../shared/Toast';

type QuickFollowUpProps = { candidate: Candidate; variant?: 'default' | 'icon' };
const isDue = (c: Candidate) => !!c.next_step_due && (isToday(parseISO(c.next_step_due)) || isBefore(parseISO(c.next_step_due), new Date()));
function getTemplate(c: Candidate) {
  if (c.stage === 'Phone Screen') return `Hi Dr. ${c.last_name},\n\nI wanted to follow up on our conversation about the ${c.specialty} opportunity at Baptist Health Paducah...`;
  if (c.stage === 'Site Visit') return `Hi Dr. ${c.last_name},\n\nWe'd love to arrange a visit to Baptist Health Paducah...`;
  if (c.stage === 'Offer') return `Hi Dr. ${c.last_name},\n\nI wanted to check in regarding the offer we discussed...`;
  return `Hi Dr. ${c.last_name},\n\nThank you for taking the time to interview with us...`;
}

export default function QuickFollowUp({ candidate, variant = 'default' }: QuickFollowUpProps) {
  const { showToast } = useToast();
  const { updateCandidate } = useCandidates();
  const { addInteraction } = useInteractions();
  const [open, setOpen] = useState(false);
  const [mark, setMark] = useState(true);
  const [text, setText] = useState(getTemplate(candidate));

  const show = useMemo(() => isDue(candidate), [candidate]);
  if (!show) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (mark) {
        await updateCandidate(candidate.id, { next_step_due: formatISO(addDays(new Date(), 7), { representation: 'date' }) });
        await addInteraction({ candidate_id: candidate.id, type: 'Email Sent', summary: 'Follow-up email sent', details: text, contact_date: new Date().toISOString() });
        showToast('Copied and follow-up logged.', 'success');
      } else showToast('Copied to clipboard.', 'success');
      setOpen(false);
    } catch {
      showToast('Could not copy follow-up text.', 'error');
    }
  };

  return (<>
    {variant === 'icon' ? (
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 opacity-0 transition hover:bg-slate-50 group-hover:opacity-100" title="Quick Follow-Up"><Send size={14} /></button>
    ) : (
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Send size={16} /> Quick Follow-Up</button>
    )}
    {open ? <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/45 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"><h3 className="text-xl font-bold text-slate-900">Quick Follow-Up</h3><textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={mark} onChange={(e) => setMark(e.target.checked)} /><span className="inline-flex items-center gap-1"><CheckSquare size={14} /> Mark as Followed Up</span></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm">Cancel</button><button type="button" onClick={() => { void copy(); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-5 text-sm font-semibold text-white"><Copy size={15} /> Copy to Clipboard</button></div></div></div> : null}
  </>);
}
