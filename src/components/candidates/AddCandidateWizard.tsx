import { useMemo, useState } from 'react';
import {
  Baby,
  Brain,
  Check,
  FlaskConical,
  Heart,
  Mail,
  MoreHorizontal,
  Search,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
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

const specialtyIcons: Record<string, LucideIcon> = {
  'Cardiothoracic Surgery': Heart,
  'Hematology/Oncology': FlaskConical,
  Gastroenterology: Stethoscope,
  Neurology: Brain,
  'OB/GYN': Baby,
  Other: MoreHorizontal,
};

const sourceIcons: Record<string, LucideIcon> = {
  Conference: Users,
  Referral: Users,
  'Job Board': Search,
  'Cold Outreach': Mail,
  'Recruiting Firm': Users,
  Other: MoreHorizontal,
};

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none';

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
      showToast(`Dr. ${created.last_name} was added successfully.`, 'success', {
        label: 'Add Voice Note',
        onClick: () => navigate(`/candidates/${created.id}?voiceNote=1`),
      });
      navigate(`/candidates/${created.id}`);
    } catch {
      showToast('Could not add doctor. Please try again.', 'error');
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <header className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">Add New Doctor</h2>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                index < step
                  ? 'bg-blue-600 text-white'
                  : index === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index < step ? <Check size={16} /> : index}
              {index === step ? <span className="absolute -inset-1 animate-ping rounded-full bg-blue-300/60" /> : null}
            </div>
          ))}
        </div>
      </header>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">First Name *</span>
              <input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Last Name *</span>
              <input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                className={inputClass}
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Specialty *</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {SPECIALTIES.map((specialty) => {
                const Icon = specialtyIcons[specialty] ?? Stethoscope;
                const isSelected = form.specialty === specialty;
                return (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, specialty }))}
                    className={`rounded-xl border-2 p-4 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Icon size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-slate-800">{specialty}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {form.specialty === 'Other' ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Enter Specialty *</span>
              <input
                value={form.customSpecialty}
                onChange={(event) => setForm((prev) => ({ ...prev, customSpecialty: event.target.value }))}
                className={inputClass}
                placeholder="e.g. Family Medicine"
              />
            </label>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Current Location</span>
              <input
                value={form.currentLocation}
                onChange={(event) => setForm((prev) => ({ ...prev, currentLocation: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Current Employer</span>
              <input
                value={form.currentEmployer}
                onChange={(event) => setForm((prev) => ({ ...prev, currentEmployer: event.target.value }))}
                className={inputClass}
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Source</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {SOURCES.map((source) => {
                const Icon = sourceIcons[source] ?? Search;
                const isSelected = form.source === source;
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, source }))}
                    className={`rounded-xl border-2 p-4 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Icon size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-slate-800">{source}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Next Step</span>
            <select
              value={form.nextStep}
              onChange={(event) => setForm((prev) => ({ ...prev, nextStep: event.target.value }))}
              className={inputClass}
            >
              {nextStepOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Next Step Due Date</span>
            <input
              type="date"
              value={form.nextStepDue}
              onChange={(event) => setForm((prev) => ({ ...prev, nextStepDue: event.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className={inputClass}
            />
          </label>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
