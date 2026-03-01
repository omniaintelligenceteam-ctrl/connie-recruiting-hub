import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCandidates } from '../../hooks/useCandidates';
import { SPECIALTIES } from '../../lib/constants';
import type { InsertCandidate } from '../../lib/database.types';
import { useToast } from './Toast';

type QuickForm = {
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
};

export default function QuickAddFAB() {
  const { addCandidate } = useCandidates();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuickForm>({
    firstName: '',
    lastName: '',
    specialty: SPECIALTIES[0],
    phone: '',
  });

  const handleQuickAdd = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast('First and last name are required.', 'error');
      return;
    }

    setSaving(true);

    const payload: InsertCandidate = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      specialty: form.specialty,
      stage: 'Sourced',
      phone: form.phone.trim() || null,
      email: null,
      current_location: null,
      current_employer: null,
      source: 'Other',
      notes: null,
      next_step: 'Send outreach email',
      next_step_due: new Date().toISOString().split('T')[0],
      lost_reason: null,
      stage_entered_at: new Date().toISOString(),
    };

    try {
      await addCandidate(payload);
      showToast('Doctor added to Sourced.', 'success');
      setOpen(false);
      setForm({ firstName: '', lastName: '', specialty: SPECIALTIES[0], phone: '' });
    } catch {
      showToast('Could not quick add doctor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl md:hidden"
        aria-label="Quick add doctor"
      >
        <Plus size={24} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 p-4 md:hidden">
          <div className="w-full rounded-2xl bg-white p-4 shadow-2xl">
            <h3 className="mb-3 text-lg font-bold text-slate-900">Quick Add Doctor</h3>
            <div className="space-y-2">
              <input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                placeholder="First Name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
              <input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                placeholder="Last Name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
              <select
                value={form.specialty}
                onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleQuickAdd();
                }}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Quick Add'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
