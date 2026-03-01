import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOURCES, SPECIALTIES } from '../../lib/constants';
import type { InsertCandidate } from '../../lib/database.types';
import { useCandidates } from '../../hooks/useCandidates';
import { useToast } from '../shared/Toast';

type FormState = {
  firstName: string;
  lastName: string;
  specialty: string;
  customSpecialty: string;
  email: string;
  phone: string;
  currentLocation: string;
  currentEmployer: string;
  source: InsertCandidate['source'] | null;
  nextStep: string;
  nextStepDue: string;
  notes: string;
};

const nextStepOptions = ['Send outreach email', 'Schedule call', 'Log a note', 'Other'];

export default function AddCandidateWizard() {
  const navigate = useNavigate();
  const { addCandidate, loading } = useCandidates();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    specialty: '',
    customSpecialty: '',
    email: '',
    phone: '',
    currentLocation: '',
    currentEmployer: '',
    source: null,
    nextStep: 'Send outreach email',
    nextStepDue: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const specialtyValue = form.specialty === 'Other' ? form.customSpecialty.trim() : form.specialty;

  const canContinueStep1 = useMemo(
    () => Boolean(form.firstName.trim() && form.lastName.trim() && specialtyValue),
    [form.firstName, form.lastName, specialtyValue],
  );

  const progressPercent = (step / 3) * 100;

  const handleSubmit = async () => {
    if (!specialtyValue) return;

    const payload: InsertCandidate = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      specialty: specialtyValue,
      stage: 'Sourced',
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      current_location: form.currentLocation.trim() || null,
      current_employer: form.currentEmployer.trim() || null,
      source: form.source,
      notes: form.notes.trim() || null,
      next_step: form.nextStep,
      next_step_due: form.nextStepDue || null,
      lost_reason: null,
      stage_entered_at: new Date().toISOString(),
    };

    try {
      const created = await addCandidate(payload);
      showToast(`Dr. ${created.last_name} was added successfully.`, 'success');
      navigate(`/candidates/${created.id}`);
    } catch {
      showToast('Could not add doctor. Please try again.', 'error');
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Add New Doctor</h2>
        <p className="text-base text-slate-600">Step {step} of 3</p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-base font-medium text-slate-700">
              First Name *
              <input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="space-y-2 text-base font-medium text-slate-700">
              Last Name *
              <input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-base font-medium text-slate-700">Specialty *</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, specialty }))}
                  className={`min-h-11 rounded-lg border px-4 text-base font-medium transition ${
                    form.specialty === specialty
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            {form.specialty === 'Other' ? (
              <label className="block space-y-2 text-base font-medium text-slate-700">
                Enter Specialty *
                <input
                  value={form.customSpecialty}
                  onChange={(event) => setForm((prev) => ({ ...prev, customSpecialty: event.target.value }))}
                  className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
                  placeholder="e.g. Family Medicine"
                />
              </label>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-base font-medium text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="space-y-2 text-base font-medium text-slate-700">
              Phone
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
              className="min-h-11 rounded-lg bg-blue-600 px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-base font-medium text-slate-700">
              Current Location
              <input
                value={form.currentLocation}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currentLocation: event.target.value }))
                }
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="space-y-2 text-base font-medium text-slate-700">
              Current Employer
              <input
                value={form.currentEmployer}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currentEmployer: event.target.value }))
                }
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-base font-medium text-slate-700">Source</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {SOURCES.map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, source }))}
                  className={`min-h-11 rounded-lg border px-4 text-base font-medium transition ${
                    form.source === source
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-11 rounded-lg border border-slate-300 px-6 text-base font-medium text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="min-h-11 rounded-lg bg-blue-600 px-6 text-base font-semibold text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="space-y-2 text-base font-medium text-slate-700">
            Next Step
            <select
              value={form.nextStep}
              onChange={(event) => setForm((prev) => ({ ...prev, nextStep: event.target.value }))}
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
            >
              {nextStepOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-base font-medium text-slate-700">
            Next Step Due Date
            <input
              type="date"
              value={form.nextStepDue}
              onChange={(event) => setForm((prev) => ({ ...prev, nextStepDue: event.target.value }))}
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
            />
          </label>

          <label className="space-y-2 text-base font-medium text-slate-700">
            Notes
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            />
          </label>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-11 rounded-lg border border-slate-300 px-6 text-base font-medium text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="min-h-11 rounded-lg bg-green-600 px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-green-300"
            >
              {loading ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
