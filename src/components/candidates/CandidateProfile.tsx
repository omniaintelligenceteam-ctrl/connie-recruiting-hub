import { useEffect, useMemo, useState } from 'react';
import { format, isBefore, isToday } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  StickyNote,
  UserRoundCheck,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCandidates } from '../../hooks/useCandidates';
import { STAGE_COLORS, STAGES, SPECIALTY_COLORS } from '../../lib/constants';
import type { Candidate, Interaction } from '../../lib/database.types';
import Badge from '../shared/Badge';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useToast } from '../shared/Toast';
import CandidateTimeline from './CandidateTimeline';
import LogInteraction from './LogInteraction';
import QuickFollowUp from './QuickFollowUp';
import VoiceNote from './VoiceNote';
import NextStepCard from './NextStepCard';
import { useInteractions } from '../../hooks/useInteractions';
import VisaSection from './sections/VisaSection';
import PaperworkSection from './sections/PaperworkSection';
import NPDBSection from './sections/NPDBSection';
import ApprovalSection from './sections/ApprovalSection';
import DocSection from './sections/DocSection';
import ThankYouLettersSection from './sections/ThankYouLettersSection';
import { recommendNextStep } from '../../lib/nextStepEngine';

type CandidateProfileProps = {
  candidateId: string;
};

function getUrgency(nextStepDue: string | null) {
  if (!nextStepDue) return 'border-l-green-500';
  const due = new Date(nextStepDue);
  const now = new Date();
  if (isBefore(due, now) && !isToday(due)) return 'border-l-red-500';
  if (isToday(due)) return 'border-l-yellow-400';
  return 'border-l-green-500';
}

const actionCards = [
  { key: 'email', label: 'Send Email', icon: Mail, tone: 'text-blue-600 bg-blue-50' },
  { key: 'prep', label: 'Prep Sheet', icon: FileText, tone: 'text-violet-600 bg-violet-50' },
  { key: 'call', label: 'Log Call', icon: Phone, tone: 'text-emerald-600 bg-emerald-50' },
  { key: 'note', label: 'Add Note', icon: StickyNote, tone: 'text-amber-600 bg-amber-50' },
  { key: 'visit', label: 'Plan Visit', icon: Calendar, tone: 'text-cyan-600 bg-cyan-50' },
  { key: 'offer', label: 'Send Offer', icon: UserRoundCheck, tone: 'text-pink-600 bg-pink-50' },
] as const;

export default function CandidateProfile({ candidateId }: CandidateProfileProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { getCandidateById, updateCandidate, deleteCandidate, loading } = useCandidates();
  const { interactions, fetchInteractions } = useInteractions();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Candidate>>({});
  const [pendingStage, setPendingStage] = useState<Candidate['stage'] | ''>('');
  const [confirmStageOpen, setConfirmStageOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [logInteractionOpen, setLogInteractionOpen] = useState(false);
  const [initialInteractionType, setInitialInteractionType] = useState<Interaction['type']>('Phone Call');

  useEffect(() => {
    const run = async () => {
      try {
        const found = await getCandidateById(candidateId);
        setCandidate(found);
        setForm(found);
        await fetchInteractions(candidateId);
      } catch {
        showToast('Could not load candidate profile.', 'error');
      }
    };

    if (candidateId) {
      void run();
    }
  }, [candidateId, getCandidateById, showToast]);

  const formattedDueDate = useMemo(() => {
    if (!candidate?.next_step_due) return 'Not set';
    return format(new Date(candidate.next_step_due), 'MMMM d, yyyy');
  }, [candidate?.next_step_due]);

  const refreshCandidate = async () => {
    const found = await getCandidateById(candidateId);
    setCandidate(found);
    setForm(found);
  };

  const handleSaveEdits = async () => {
    if (!candidate) return;

    try {
      await updateCandidate(candidate.id, {
        first_name: form.first_name ?? candidate.first_name,
        last_name: form.last_name ?? candidate.last_name,
        email: form.email ?? null,
        phone: form.phone ?? null,
        current_location: form.current_location ?? null,
        current_employer: form.current_employer ?? null,
        specialty: form.specialty ?? candidate.specialty,
        source: form.source ?? null,
        notes: form.notes ?? null,
        next_step: form.next_step ?? null,
        next_step_due: form.next_step_due ?? null,
      });
      await refreshCandidate();
      setEditMode(false);
      showToast('Candidate updated.', 'success');
    } catch {
      showToast('Could not update candidate.', 'error');
    }
  };

  const handleStageChange = async () => {
    if (!candidate || !pendingStage) return;

    try {
      await updateCandidate(candidate.id, { stage: pendingStage });
      await refreshCandidate();
      showToast('Stage updated.', 'success');
    } catch {
      showToast('Could not update stage.', 'error');
    } finally {
      setConfirmStageOpen(false);
      setPendingStage('');
    }
  };

  const handleDelete = async () => {
    if (!candidate) return;

    try {
      await deleteCandidate(candidate.id);
      showToast('Candidate deleted.', 'success');
      navigate('/pipeline');
    } catch {
      showToast('Could not delete candidate.', 'error');
    }
  };

  if (!candidate) {
    return <p className="text-base text-slate-600">Loading candidate profile...</p>;
  }

  const pillClass = 'inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/90';

  return (
    <section className="space-y-6">
      {candidate && (() => {
        const rec = recommendNextStep(candidate, interactions, new Date());
        return rec ? (
          <NextStepCard
            recommendation={rec}
            onAction={(action) => {
              if (action === 'interview_prep') {
                navigate(`/candidates/${candidateId}/prep`);
              } else if (action === 'send_outreach' || action === 'nurture_touch') {
                navigate(`/email?candidateId=${candidateId}`);
              }
            }}
          />
        ) : null;
      })()}
      <Link to="/pipeline" className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-blue-700">
        <ArrowLeft size={18} /> Back to Pipeline
      </Link>

      <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Dr. {candidate.first_name} {candidate.last_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge label={candidate.specialty} colorClass={`${SPECIALTY_COLORS[candidate.specialty]} text-xs`} />
              <Badge label={candidate.stage} variant="stage" colorClass={`${STAGE_COLORS[candidate.stage]} text-xs`} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              {editMode ? 'Cancel Edit' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={pillClass}>
            <Phone size={14} />
            {candidate.phone ? <a href={`tel:${candidate.phone}`}>{candidate.phone}</a> : 'No phone set'}
          </span>
          <span className={pillClass}>
            <Mail size={14} />
            {candidate.email ? <a href={`mailto:${candidate.email}`}>{candidate.email}</a> : 'No email set'}
          </span>
          <span className={pillClass}>
            <MapPin size={14} /> {candidate.current_location ?? 'No location set'}
          </span>
          {candidate.source && (
            <span className={pillClass}>
              <UserRoundCheck size={14} /> {candidate.source}
            </span>
          )}
        </div>
      </div>

      <div className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${getUrgency(candidate.next_step_due)}`}>
        <p className="text-xs font-bold tracking-wide text-slate-500">NEXT STEP</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{candidate.next_step ?? 'No next step set'}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Calendar size={14} /> Due: {formattedDueDate}
        </p>
        <Link
          to={`/email?candidate=${candidate.id}`}
          className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Do It Now
        </Link>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <label className="text-sm font-medium text-slate-700">
            Stage:{' '}
            <select
              value={candidate.stage}
              onChange={(event) => {
                setPendingStage(event.target.value as Candidate['stage']);
                setConfirmStageOpen(true);
              }}
              className="rounded-lg border border-slate-300 px-2 py-1"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {actionCards.map(({ key, label, icon: Icon, tone }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === 'email') navigate(`/email?candidate=${candidate.id}`);
                if (key === 'prep') navigate(`/candidates/${candidate.id}/prep`);
                if (key === 'call') {
                  setInitialInteractionType('Phone Call');
                  setLogInteractionOpen(true);
                }
                if (key === 'note') {
                  setInitialInteractionType('Note');
                  setLogInteractionOpen(true);
                }
                if (key === 'visit') navigate(`/candidates/${candidate.id}/site-visit`);
              }}
              className="rounded-xl bg-white p-3 text-center shadow-sm transition hover:shadow-md"
            >
              <span className={`mx-auto mb-1 inline-flex rounded-lg p-2 ${tone}`}>
                <Icon size={16} />
              </span>
              <span className="block text-xs font-medium text-slate-700">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-2">
          <QuickFollowUp candidate={candidate} />
        </div>

        <div className="mt-3">
          <VoiceNote candidateId={candidateId} autoStart={searchParams.get('voiceNote') === '1'} />
        </div>
      </div>

      {editMode ? (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Edit Candidate</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.first_name ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, first_name: event.target.value }))}
              placeholder="First name"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.last_name ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, last_name: event.target.value }))}
              placeholder="Last name"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.phone ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.email ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.current_location ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, current_location: event.target.value }))}
              placeholder="Current location"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.current_employer ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, current_employer: event.target.value }))}
              placeholder="Current employer"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.specialty ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value as Candidate['specialty'] }))}
              placeholder="Specialty"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.source ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value as Candidate['source'] }))}
              placeholder="How they found us"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
              value={form.next_step ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, next_step: event.target.value }))}
              placeholder="Next step"
            />
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={(form.next_step_due ?? '').split('T')[0]}
              onChange={(event) => setForm((prev) => ({ ...prev, next_step_due: event.target.value }))}
            />
            <textarea
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              value={form.notes ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              rows={6}
              placeholder="Notes about this candidate..."
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.specialty ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
              placeholder="Specialty"
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              value={form.source ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value as Candidate['source'] }))}
              placeholder="Source (how they connected)"
            />
            <textarea
              className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
              rows={6}
              value={form.notes ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Notes about this candidate..."
            />
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  void handleSaveEdits();
                }}
                disabled={loading}
                className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Notes</h2>
        {editMode ? (
          <textarea
            value={form.notes ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Notes about this candidate..."
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-slate-700">{candidate.notes ?? 'No notes yet.'}</p>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Notes</h2>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{candidate.notes ?? 'No notes yet.'}</p>
      </div>

      <VisaSection candidate={candidate} onUpdate={refreshCandidate} />
      <PaperworkSection candidate={candidate} onUpdate={refreshCandidate} />
      <NPDBSection candidate={candidate} onUpdate={refreshCandidate} />
      <ApprovalSection candidate={candidate} />
      <DocSection candidate={candidate} />
      <ThankYouLettersSection candidateId={candidateId} />

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Timeline</h2>
        <CandidateTimeline candidateId={candidateId} />
      </div>

      <LogInteraction
        candidateId={candidateId}
        open={logInteractionOpen}
        initialType={initialInteractionType}
        onClose={() => setLogInteractionOpen(false)}
        onSaved={() => {
          void refreshCandidate();
        }}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete candidate"
        message={`Are you sure you want to delete Dr. ${candidate.first_name} ${candidate.last_name}? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          void handleDelete();
        }}
        variant="danger"
      />

      <ConfirmDialog
        open={confirmStageOpen}
        title="Confirm stage change"
        message={pendingStage ? `Move to ${pendingStage}?` : 'Confirm stage change?'}
        confirmLabel="Confirm"
        onCancel={() => {
          setConfirmStageOpen(false);
          setPendingStage('');
        }}
        onConfirm={() => {
          void handleStageChange();
        }}
      />
    </section>
  );
}
