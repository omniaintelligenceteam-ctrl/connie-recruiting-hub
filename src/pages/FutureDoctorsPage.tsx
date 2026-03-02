import { Fragment, useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FutureDoctor, InsertFutureDoctor, UpdateFutureDoctor } from '../lib/database.types';

type ConnectionType = 'Conference' | 'Referral' | 'Future Physicians Program' | 'Cold Outreach' | 'Other';

const connectionOptions: ConnectionType[] = ['Conference', 'Referral', 'Future Physicians Program', 'Cold Outreach', 'Other'];

const seedDoctors: InsertFutureDoctor[] = [
  { first_name: 'Dalton', last_name: 'Riley', specialty: 'FM', expected_start_year: 2028 },
  { first_name: 'Logan', last_name: 'Elliott', specialty: 'ENT', expected_start_year: 2030 },
  { first_name: 'Andrew', last_name: 'Zaninovich', specialty: 'ENT', expected_start_year: 2028 },
  { first_name: 'Luke', last_name: 'Meredith', specialty: 'CTS fellowship', expected_start_year: 2028 },
  { first_name: 'William', last_name: 'Durchholz', specialty: 'Ortho', expected_start_year: 2029 },
  { first_name: 'Jonnah', last_name: 'McManus', specialty: 'FM', expected_start_year: 2027, notes: 'Start date target: 9/1/27' },
];

const emptyForm: InsertFutureDoctor = {
  first_name: '',
  last_name: '',
  specialty: '',
  current_school: '',
  current_program: '',
  expected_start_year: null,
  how_connected: null,
  notes: '',
  next_checkin: null,
};

export default function FutureDoctorsPage() {
  const [doctors, setDoctors] = useState<FutureDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<InsertFutureDoctor>(emptyForm);
  const [editForm, setEditForm] = useState<UpdateFutureDoctor>({});

  async function fetchDoctors() {
    setLoading(true);
    const { data, error } = await supabase
      .from('future_doctors')
      .select('*')
      .order('expected_start_year', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    setLoading(false);

    if (error) {
      console.error('Failed to fetch future doctors', error);
      return;
    }

    setDoctors((data ?? []) as FutureDoctor[]);
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!expandedId) return;
    const selected = doctors.find((doctor) => doctor.id === expandedId);
    if (!selected) return;

    setEditForm({
      first_name: selected.first_name,
      last_name: selected.last_name,
      specialty: selected.specialty,
      current_school: selected.current_school,
      current_program: selected.current_program,
      expected_start_year: selected.expected_start_year,
      how_connected: selected.how_connected,
      notes: selected.notes,
      next_checkin: selected.next_checkin,
    });
  }, [expandedId, doctors]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await supabase.from('future_doctors').insert(createForm);
    if (error) {
      console.error('Failed to create future doctor', error);
      return;
    }

    setCreateForm(emptyForm);
    setShowModal(false);
    await fetchDoctors();
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!expandedId) return;

    const { error } = await supabase.from('future_doctors').update(editForm).eq('id', expandedId);
    if (error) {
      console.error('Failed to update future doctor', error);
      return;
    }

    await fetchDoctors();
  }

  async function importSeedDoctors() {
    const { error } = await supabase.from('future_doctors').upsert(seedDoctors, { onConflict: 'first_name,last_name' });
    if (error) {
      console.error('Failed to import seed doctors', error);
      return;
    }
    await fetchDoctors();
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Future Doctors</h1>
          <p className="text-base text-slate-600">Track doctors by expected start year and keep clean follow-up notes.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={importSeedDoctors} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Import Existing List
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={16} />
            Add Doctor
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Specialty</th>
              <th className="px-4 py-3 font-semibold">School/Program</th>
              <th className="px-4 py-3 font-semibold">Expected Year</th>
              <th className="px-4 py-3 font-semibold">Next Check-in</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map((doctor) => (
              <Fragment key={doctor.id}>
                <tr
                  key={doctor.id}
                  onClick={() => setExpandedId((current) => (current === doctor.id ? null : doctor.id))}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{doctor.first_name} {doctor.last_name}</td>
                  <td className="px-4 py-3 text-slate-700">{doctor.specialty || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{[doctor.current_school, doctor.current_program].filter(Boolean).join(' / ') || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{doctor.expected_start_year ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{doctor.next_checkin || '-'}</td>
                  <td className="max-w-sm truncate px-4 py-3 text-slate-700">{doctor.notes || '-'}</td>
                </tr>

                {expandedId === doctor.id && (
                  <tr key={`${doctor.id}-expanded`}>
                    <td className="bg-slate-50 px-4 py-4" colSpan={6}>
                      <DoctorForm
                        form={editForm}
                        setForm={setEditForm}
                        onSubmit={handleSaveEdit}
                        submitLabel="Save Changes"
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {!loading && doctors.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  No future doctors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Add Future Doctor</h2>
              <button onClick={() => setShowModal(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <DoctorForm form={createForm} setForm={setCreateForm} onSubmit={handleAdd} submitLabel="Save Doctor" />
          </div>
        </div>
      )}
    </section>
  );
}

type DoctorFormProps = {
  form: InsertFutureDoctor | UpdateFutureDoctor;
  setForm: Dispatch<SetStateAction<InsertFutureDoctor>> | Dispatch<SetStateAction<UpdateFutureDoctor>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitLabel: string;
};

function DoctorForm({ form, setForm, onSubmit, submitLabel }: DoctorFormProps) {
  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input value={form.first_name ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, first_name: e.target.value }))} placeholder="First Name" className="rounded-lg border border-slate-300 px-3 py-2" required />
      <input value={form.last_name ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, last_name: e.target.value }))} placeholder="Last Name" className="rounded-lg border border-slate-300 px-3 py-2" required />
      <input value={form.specialty ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, specialty: e.target.value }))} placeholder="Specialty pursuing" className="rounded-lg border border-slate-300 px-3 py-2" />
      <input value={form.current_school ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, current_school: e.target.value }))} placeholder="Current school" className="rounded-lg border border-slate-300 px-3 py-2" />
      <input value={form.current_program ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, current_program: e.target.value }))} placeholder="Current program" className="rounded-lg border border-slate-300 px-3 py-2" />
      <input type="number" value={form.expected_start_year ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, expected_start_year: e.target.value ? Number(e.target.value) : null }))} placeholder="Expected year" className="rounded-lg border border-slate-300 px-3 py-2" />
      <select value={form.how_connected ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, how_connected: e.target.value || null }))} className="rounded-lg border border-slate-300 px-3 py-2">
        <option value="">How they connected</option>
        {connectionOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <input type="date" value={form.next_checkin ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, next_checkin: e.target.value || null }))} className="rounded-lg border border-slate-300 px-3 py-2" />
      <textarea value={form.notes ?? ''} onChange={(e) => (setForm as any)((p: any) => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={3} className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" />

      <div className="md:col-span-2">
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
