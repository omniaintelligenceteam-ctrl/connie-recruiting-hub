import { Loader2, Sparkles, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { sendMessage } from '../../lib/openclawClient';
import type { Candidate } from '../../lib/database.types';
import { useToast } from '../shared/Toast';
import type { TemplateData } from './TemplateSelector';

type EmailComposerProps = {
  candidate: Candidate | null;
  template: TemplateData | null;
  onSend: (payload: { to: string; subject: string; body: string }) => void;
};

function applyTemplate(templateText: string, candidate: Candidate | null) {
  const lastName = candidate?.last_name ?? 'Last Name';
  const specialty = candidate?.specialty ?? 'Specialty';

  return templateText
    .replaceAll('[Last Name]', lastName)
    .replaceAll('[Specialty]', specialty)
    .replaceAll('[specialty]', specialty.toLowerCase());
}

export default function EmailComposer({ candidate, template, onSend }: EmailComposerProps) {
  const { showToast } = useToast();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [improving, setImproving] = useState(false);
  const [beforeText, setBeforeText] = useState<string | null>(null);
  const [afterText, setAfterText] = useState<string | null>(null);

  useEffect(() => {
    if (candidate?.email) {
      setTo(`${candidate.first_name} ${candidate.last_name} <${candidate.email}>`);
    } else {
      setTo('');
    }
  }, [candidate]);

  useEffect(() => {
    if (!template) {
      return;
    }

    setSubject(applyTemplate(template.subject, candidate));
    setBody(applyTemplate(template.body, candidate));
    setBeforeText(null);
    setAfterText(null);
  }, [template, candidate]);

  const charCount = useMemo(() => body.length, [body]);

  const handleImproveWithAI = async () => {
    if (!body.trim()) {
      showToast('Add draft text first, then improve it.', 'error');
      return;
    }

    setImproving(true);
    const original = body;
    setBeforeText(original);

    const prompt = `Improve this physician recruitment email. Make it professional, warm, and compelling. Keep it concise. Here's the draft: ${original}`;
    const improved = await sendMessage(prompt);

    setBody(improved);
    setAfterText(improved);
    setImproving(false);
    showToast('Draft improved with AI.', 'success');
  };

  const handleUndo = () => {
    if (!beforeText) return;
    setBody(beforeText);
    setAfterText(null);
    showToast('Reverted to original draft.', 'info');
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Compose email</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void handleImproveWithAI();
            }}
            disabled={improving}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {improving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {improving ? 'Improving...' : 'Improve with AI'}
          </button>
          {beforeText ? (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <Undo2 size={16} /> Undo
            </button>
          ) : null}
        </div>
      </div>

      {beforeText && afterText ? (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Before</p>
            <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-slate-700">{beforeText}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">After</p>
            <p className="whitespace-pre-wrap rounded-lg bg-blue-50 p-3 text-sm text-slate-800">{afterText}</p>
          </div>
        </div>
      ) : null}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">To</span>
        <input
          type="text"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="Type recipient name/email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Email subject"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Body</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write your email"
          className="min-h-[300px] w-full rounded-xl border border-slate-200 p-4 text-[16px] leading-relaxed focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </label>

      <div className="flex items-center justify-between">
        <p className="text-base text-slate-600">{charCount} characters</p>
        <button
          type="button"
          onClick={() => onSend({ to: to.trim(), subject: subject.trim(), body })}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Continue to Preview
        </button>
      </div>
    </section>
  );
}
