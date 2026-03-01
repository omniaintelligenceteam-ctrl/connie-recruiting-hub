import { useEffect, useMemo, useState } from 'react';
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
  }, [template, candidate]);

  const charCount = useMemo(() => body.length, [body]);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Compose email</h3>
        <button
          type="button"
          onClick={() => showToast('AI feature coming soon', 'info')}
          className="min-h-11 rounded-lg border border-blue-200 bg-blue-50 px-4 text-base font-semibold text-blue-700"
        >
          Improve with AI
        </button>
      </div>

      <label className="block space-y-2 text-base font-medium text-slate-700">
        To
        <input
          type="text"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="Type recipient name/email"
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
        />
      </label>

      <label className="block space-y-2 text-base font-medium text-slate-700">
        Subject
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Email subject"
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
        />
      </label>

      <label className="block space-y-2 text-base font-medium text-slate-700">
        Body
        <textarea
          rows={14}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write your email"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-[16px] leading-relaxed"
        />
      </label>

      <div className="flex items-center justify-between">
        <p className="text-base text-slate-600">{charCount} characters</p>
        <button
          type="button"
          onClick={() => onSend({ to: to.trim(), subject: subject.trim(), body })}
          className="min-h-11 rounded-lg bg-blue-600 px-4 text-base font-semibold text-white"
        >
          Continue to Preview
        </button>
      </div>
    </section>
  );
}
