import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, FileText, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidates } from '../../hooks/useCandidates';
import { STAGE_COLORS, STAGES, SPECIALTY_COLORS } from '../../lib/constants';
import type { Candidate, Interaction } from '../../lib/database.types';
import Badge from '../shared/Badge';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useToast } from '../shared/Toast';
import CandidateTimeline from './CandidateTimeline';
import LogInteraction from './LogInteraction';

type CandidateProfileProps = {
  candidateId: string;
};

export default function CandidateProfile({ candidateId }: CandidateProfileProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getCandidateById, updateCandidate, deleteCandidate, loading } = useCandidates();

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
        source: form.source ?? null,
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

  return (
    <section className="space-y-6">
      <Link to="/pipeline" className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-blue-700">
        <ArrowLeft size={18} /> Back to Pipeline
      </Link>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dr. {candidate.first_name} {candidate.last_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge label={candidate.specialty} colorClass={SPECIALTY_COLORS[candidate.specialty]} />
              <Badge label={candidate.stage} colorClass={STAGE_COLORS[candidate.stage]} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
              className="min-h-11 rounded-lg border border-slate-300 px-4 text-base font-medium text-slate-700"
            >
              {editMode ? 'Cancel Edit' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="min-h-11 rounded-lg bg-red-600 px-4 text-base font-semibold text-white"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-base text-slate-700 md:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <Phone size={16} />
            {candidate.phone ? (
              <a href={`tel:${candidate.phone}`} className="text-blue-700 underline">
                {candidate.phone}
              </a>
            ) : (
              'No phone set'
            )}
          </p>
          <p className="inline-flex items-center gap-2">
            <Mail size={16} />
            {candidate.email ? (
              <a href={`mailto:${candidate.email}`} className="text-blue-700 underline">
                {candidate.email}
              </a>
            ) : (
              'No email set'
            )}
          </p>
          <p className="inline-flex items-center gap-2">
            <MapPin size={16} /> {candidate.current_location ?? 'No location set'}
          </p>
          <p>🏥 {candidate.current_employer ?? 'No employer set'}</p>
          <p>📋 Source: {candidate.source ?? 'Unknown'}</p>
        </div>

        <div className="mt-4">
          <label className="block space-y-2 text-base font-medium text-slate-700">
            Stage
            <select
              value={candidate.stage}
              onChange={(event) => {
                setPendingStage(event.target.value as Candidate['stage']);
                setConfirmStageOpen(true);
              }}
              className="min-h-11 w-full max-w-sm rounded-lg border border-slate-300 px-3 text-base"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
        </div>

        {editMode ? (
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={form.first_name ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, first_name: event.target.value }))}
              placeholder="First name"
            />
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={form.last_name ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, last_name: event.target.value }))}
              placeholder="Last name"
            />
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={form.phone ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone"
            />
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={form.email ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
            />
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={form.current_location ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, current_location: event.target.value }))}
              placeholder="Current location"
            />
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={form.current_employer ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, current_employer: event.target.value }))}
              placeholder="Current employer"
            />
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base md:col-span-2"
              value={form.next_step ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, next_step: event.target.value }))}
              placeholder="Next step"
            />
            <input
              type="date"
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
              value={(form.next_step_due ?? '').split('T')[0]}
              onChange={(event) => setForm((prev) => ({ ...prev, next_step_due: event.target.value }))}
            />
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  void handleSaveEdits();
                }}
                disabled={loading}
                className="min-h-11 rounded-lg bg-green-600 px-4 text-base font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-bold tracking-wide text-blue-700">⚡ NEXT STEP</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{candidate.next_step ?? 'No next step set'}</p>
        <p className="mt-1 text-base text-slate-700">Due: {formattedDueDate}</p>
        <Link
          to={`/email?candidate=${candidate.id}`}
          className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 text-base font-semibold text-white"
        >
          Do It Now
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/email?candidate=${candidate.id}`}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700"
          >
            📧 Send Email
          </Link>
          <Link
            to={`/candidates/${candidate.id}/prep`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700"
          >
            <FileText size={16} /> 📋 Prep Sheet
          </Link>
          <button
            type="button"
            onClick={() => {
              setInitialInteractionType('Phone Call');
              setLogInteractionOpen(true);
            }}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700"
          >
            📞 Log Call
          </button>
          <button
            type="button"
            onClick={() => {
              setInitialInteractionType('Note');
              setLogInteractionOpen(true);
            }}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700"
          >
            📝 Add Note
          </button>
          <button
            type="button"
            onClick={() => navigate(`/candidates/${candidate.id}/site-visit`)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700"
          >
            <Calendar size={16} /> Plan Visit
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700"
          >
            📄 Send Offer
          </button>
        </div>
      </div>

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
