import { Check, ClipboardCopy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCandidates } from '../../hooks/useCandidates';
import { supabase } from '../../lib/supabase';
import type { Candidate } from '../../lib/database.types';
import { useToast } from '../shared/Toast';
import EmailComposer from './EmailComposer';
import EmailPreview from './EmailPreview';
import TemplateSelector, { type TemplateData, type TemplateKey } from './TemplateSelector';

type ComposedEmail = {
  to: string;
  subject: string;
  body: string;
};

type EmailHubLocationState = {
  candidateId?: string;
};

const blankEmailTemplate: TemplateData = {
  name: 'Blank Email',
  subject: '',
  body: '',
};

export default function EmailHub() {
  const { candidates, fetchCandidates } = useCandidates();
  const location = useLocation();
  const routeState = (location.state as EmailHubLocationState | null) ?? null;
  const { showToast } = useToast();
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<TemplateKey | 'blank' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [draftEmail, setDraftEmail] = useState<ComposedEmail>({ to: '', subject: '', body: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCandidates().catch(() => {
      showToast('Could not load candidates.', 'error');
    });
  }, [fetchCandidates, showToast]);

  useEffect(() => {
    if (routeState?.candidateId) {
      setSelectedCandidateId(routeState.candidateId);
    }
  }, [routeState?.candidateId]);

  const selectedCandidate = useMemo<Candidate | null>(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId],
  );

  const canFinalize = Boolean(draftEmail.subject.trim() && draftEmail.body.trim());

  const handleCopyToClipboard = async () => {
    if (!canFinalize) {
      showToast('Please add subject and body before copying.', 'error');
      return;
    }

    const fullText = `Subject: ${draftEmail.subject}\n\n${draftEmail.body}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Email copied to clipboard. Paste into Outlook.', 'success');
    } catch {
      showToast('Could not copy to clipboard.', 'error');
    }
  };

  const handleSaveDraft = async () => {
    if (!canFinalize) {
      showToast('Please add subject and body before saving.', 'error');
      return;
    }

    setSavingDraft(true);

    const { error } = await supabase.from('email_drafts').insert({
      candidate_id: selectedCandidate?.id ?? null,
      template_name:
        selectedTemplateKey === 'blank' || selectedTemplateKey === null ? 'Blank Email' : selectedTemplate?.name,
      subject: draftEmail.subject,
      body: draftEmail.body,
      status: 'draft',
    });

    setSavingDraft(false);

    if (error) {
      showToast('Could not save draft.', 'error');
      return;
    }

    showToast('Draft saved.', 'success');
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">Email Hub</h2>
        <p className="mt-2 text-base text-slate-600">
          Build your email, review it, then copy to clipboard to paste into Outlook.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <p className="text-base font-semibold text-slate-900">Step 1: Select Candidate (optional)</p>
        <select
          value={selectedCandidateId}
          onChange={(event) => setSelectedCandidateId(event.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-base"
        >
          <option value="">Manual recipient (no candidate selected)</option>
          {candidates.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              Dr. {candidate.first_name} {candidate.last_name} — {candidate.specialty}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base font-semibold text-slate-900">Step 2: Choose template</p>
          <button
            type="button"
            onClick={() => {
              setSelectedTemplateKey('blank');
              setSelectedTemplate(blankEmailTemplate);
              setShowPreview(false);
            }}
            className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold ${
              selectedTemplateKey === 'blank'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-700'
            }`}
          >
            Blank Email
          </button>
        </div>

        <TemplateSelector
          onSelect={(key, template) => {
            setSelectedTemplateKey(key);
            setSelectedTemplate(template);
            setShowPreview(false);
          }}
        />
      </div>

      <div>
        <p className="mb-3 text-base font-semibold text-slate-900">Step 3: Draft</p>
        <EmailComposer
          candidate={selectedCandidate}
          template={selectedTemplate}
          onSend={(payload) => {
            setDraftEmail(payload);
            setShowPreview(true);
          }}
        />
      </div>

      {showPreview && (
        <div className="space-y-4">
          <p className="text-base font-semibold text-slate-900">Step 4: Preview</p>
          <EmailPreview
            subject={draftEmail.subject}
            body={draftEmail.body}
            recipientName={draftEmail.to}
            onLooksGood={() => showToast('Great. Ready to copy to clipboard.', 'success')}
            onEditMore={() => setShowPreview(false)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <button
          type="button"
          onClick={handleCopyToClipboard}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-3 text-lg font-semibold text-white"
        >
          {copied ? <Check size={18} /> : <ClipboardCopy size={18} />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={savingDraft}
          className="rounded-xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingDraft ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
    </section>
  );
}
