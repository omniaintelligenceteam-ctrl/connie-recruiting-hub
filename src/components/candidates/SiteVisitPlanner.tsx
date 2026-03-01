import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, ClipboardList, Printer, Share2, Trash2 } from 'lucide-react';
import { useCandidates } from '../../hooks/useCandidates';
import { useSiteVisit } from '../../hooks/useSiteVisit';
import type { NotifyPerson, ScheduleItem, SiteVisit } from '../../lib/database.types';
import Badge from '../shared/Badge';
import { useToast } from '../shared/Toast';

type SiteVisitPlannerProps = {
  candidateId: string;
};

type ManualChecklist = {
  itinerarySent: boolean;
  welcomePacket: boolean;
  compensationReady: boolean;
};

const STATUS_COLORS: Record<SiteVisit['status'], string> = {
  planning: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const DEFAULT_SCHEDULE: Omit<ScheduleItem, 'id'>[] = [
  { time: '8:30 AM', activity: 'Welcome & Coffee', location: 'Main Lobby', attendees: 'Recruiter (Connie)' },
  { time: '9:00 AM', activity: 'Facility Tour', location: 'Hospital Campus', attendees: 'Department Head' },
  { time: '10:30 AM', activity: 'Department Meeting', location: 'Conference Room', attendees: 'Specialty Team' },
  { time: '12:00 PM', activity: 'Lunch', location: 'Local Restaurant', attendees: 'Department Head + Team' },
  { time: '1:30 PM', activity: 'Administration Meeting', location: 'Admin Office', attendees: 'CMO/VP Medical Affairs' },
  { time: '2:30 PM', activity: 'Compensation Discussion', location: 'HR Office', attendees: 'HR Director' },
  { time: '3:30 PM', activity: 'Community Tour', location: 'Paducah Area', attendees: 'Recruiter (Connie)' },
  { time: '6:00 PM', activity: 'Dinner', location: 'Restaurant TBD', attendees: 'Department Head + Spouse' },
];

export default function SiteVisitPlanner({ candidateId }: SiteVisitPlannerProps) {
  const { showToast } = useToast();
  const { getCandidateById } = useCandidates();
  const { siteVisit, loading, fetchSiteVisit, createSiteVisit, updateSiteVisit } = useSiteVisit();

  const [candidateName, setCandidateName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [visit, setVisit] = useState<SiteVisit | null>(null);
  const [manualChecklist, setManualChecklist] = useState<ManualChecklist>({
    itinerarySent: false,
    welcomePacket: false,
    compensationReady: false,
  });
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const [newBlock, setNewBlock] = useState({ time: '', activity: '', location: '', attendees: '' });
  const [newPerson, setNewPerson] = useState({ name: '', role: '' });

  useEffect(() => {
    const run = async () => {
      try {
        const candidate = await getCandidateById(candidateId);
        setCandidateName(`Dr. ${candidate.first_name} ${candidate.last_name}`);
        setSpecialty(candidate.specialty);

        const existing = await fetchSiteVisit(candidateId);
        if (existing) {
          setVisit(existing);
          return;
        }

        const created = await createSiteVisit({
          candidate_id: candidateId,
          visit_date: null,
          visit_end_date: null,
          status: 'planning',
          flight_booked: false,
          hotel_booked: false,
          rental_car: false,
          travel_notes: null,
          schedule: [],
          notify_list: [],
          visit_rating: null,
          visit_notes: null,
        });
        setVisit(created);
      } catch {
        showToast('Could not load site visit planner.', 'error');
      }
    };

    void run();
  }, [candidateId, createSiteVisit, fetchSiteVisit, getCandidateById, showToast]);

  useEffect(() => {
    if (siteVisit) {
      setVisit(siteVisit);
    }
  }, [siteVisit]);

  const schedule = visit?.schedule ?? [];
  const notifyList = visit?.notify_list ?? [];

  const keyPeopleNotified = useMemo(() => {
    const roles = ['Department Head', 'CMO', 'HR Director', 'Practice Manager'];
    const found = roles.map((role) => notifyList.find((person) => person.name.includes(role) || person.role.includes(role)));
    return found.every((person) => Boolean(person?.notified));
  }, [notifyList]);

  const checklist = useMemo(() => {
    const items = [
      Boolean(visit?.visit_date),
      Boolean(visit?.flight_booked),
      Boolean(visit?.hotel_booked),
      schedule.length >= 3,
      keyPeopleNotified,
      manualChecklist.itinerarySent,
      manualChecklist.welcomePacket,
      manualChecklist.compensationReady,
    ];

    const completed = items.filter(Boolean).length;
    return { completed, total: items.length, items };
  }, [keyPeopleNotified, manualChecklist, schedule.length, visit]);

  const updateVisit = async (updates: Partial<SiteVisit>) => {
    if (!visit) return;
    try {
      const updated = await updateSiteVisit(visit.id, updates);
      setVisit(updated);
    } catch {
      showToast('Could not save site visit changes.', 'error');
    }
  };

  const addScheduleBlock = async () => {
    if (!visit) return;
    if (!newBlock.time || !newBlock.activity) {
      showToast('Time and activity are required.', 'error');
      return;
    }

    const item: ScheduleItem = { id: crypto.randomUUID(), ...newBlock };
    await updateVisit({ schedule: [...schedule, item] });
    setNewBlock({ time: '', activity: '', location: '', attendees: '' });
    setAddBlockOpen(false);
  };

  const deleteScheduleBlock = async (itemId: string) => {
    if (!visit) return;
    if (!window.confirm('Delete this schedule block?')) return;
    await updateVisit({ schedule: schedule.filter((item) => item.id !== itemId) });
  };

  const useStandardTemplate = async () => {
    if (!visit) return;
    const templated = DEFAULT_SCHEDULE.map((item) => ({ ...item, id: crypto.randomUUID() }));
    await updateVisit({ schedule: templated });
    showToast('Standard schedule template added.', 'success');
  };

  const addPerson = async () => {
    if (!visit) return;
    if (!newPerson.name || !newPerson.role) {
      showToast('Name and role are required.', 'error');
      return;
    }

    const person: NotifyPerson = {
      id: crypto.randomUUID(),
      name: newPerson.name,
      role: newPerson.role,
      notified: false,
      notified_at: null,
    };

    await updateVisit({ notify_list: [...notifyList, person] });
    setNewPerson({ name: '', role: '' });
    setAddPersonOpen(false);
  };

  const addStandardPeople = async () => {
    if (!visit) return;
    const defaults: NotifyPerson[] = [
      { id: crypto.randomUUID(), name: 'Department Head', role: `${specialty} Department`, notified: false, notified_at: null },
      { id: crypto.randomUUID(), name: 'CMO', role: 'Administration', notified: false, notified_at: null },
      { id: crypto.randomUUID(), name: 'HR Director', role: 'Human Resources', notified: false, notified_at: null },
      { id: crypto.randomUUID(), name: 'Practice Manager', role: `${specialty} Department`, notified: false, notified_at: null },
    ];

    await updateVisit({ notify_list: defaults });
    showToast('Standard notify list added.', 'success');
  };

  const toggleNotify = async (personId: string) => {
    const next = notifyList.map((person) =>
      person.id === personId
        ? { ...person, notified: !person.notified, notified_at: !person.notified ? new Date().toISOString() : null }
        : person,
    );
    await updateVisit({ notify_list: next });
  };

  const printItinerary = () => {
    const content = document.getElementById('print-itinerary');
    if (!content) return;
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) return;
    popup.document.write(`<html><head><title>Itinerary</title></head><body>${content.innerHTML}</body></html>`);
    popup.document.close();
    popup.print();
  };

  const shareItinerary = async () => {
    if (!visit) return;

    const lines = [
      `${candidateName} Site Visit Itinerary`,
      `Specialty: ${specialty}`,
      `Date: ${visit.visit_date ?? 'TBD'}${visit.visit_end_date ? ` to ${visit.visit_end_date}` : ''}`,
      '',
      ...schedule.map((block) => `${block.time} — ${block.activity} | ${block.location} | ${block.attendees}`),
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      showToast('Itinerary copied to clipboard.', 'success');
    } catch {
      showToast('Clipboard access failed.', 'error');
    }
  };

  if (!visit) {
    return <p className="text-base text-slate-600">{loading ? 'Loading site visit planner...' : 'Preparing planner...'}</p>;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Site Visit Planner</h1>
          <div className="flex gap-2">
            <button type="button" onClick={printItinerary} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700">
              <Printer size={16} /> Print Itinerary
            </button>
            <button type="button" onClick={shareItinerary} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700">
              <Share2 size={16} /> Share Itinerary
            </button>
          </div>
        </div>
        <p className="mb-2 text-sm text-slate-600">Progress: {checklist.completed}/{checklist.total} items complete</p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${(checklist.completed / checklist.total) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Visit Details</h2>
        <p className="text-base font-medium text-slate-800">{candidateName}</p>
        <p className="mb-3 text-sm text-slate-600">{specialty}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Visit start date
            <input type="date" value={visit.visit_date ?? ''} onChange={(e) => void updateVisit({ visit_date: e.target.value || null })} className="min-h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Visit end date (optional)
            <input type="date" value={visit.visit_end_date ?? ''} onChange={(e) => void updateVisit({ visit_end_date: e.target.value || null })} className="min-h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge label={visit.status} colorClass={STATUS_COLORS[visit.status]} />
          <select value={visit.status} onChange={(e) => void updateVisit({ status: e.target.value as SiteVisit['status'] })} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm">
            <option value="planning">planning</option>
            <option value="confirmed">confirmed</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Travel Checklist</h2>
        <div className="space-y-3">
          {[
            { key: 'flight_booked', label: 'Flight booked' },
            { key: 'hotel_booked', label: 'Hotel reserved' },
            { key: 'rental_car', label: 'Rental car arranged' },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 text-base text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(visit[item.key as keyof SiteVisit])}
                onChange={(e) =>
                  void updateVisit({ [item.key]: e.target.checked } as Partial<SiteVisit>)
                }
                className="h-5 w-5"
              />
              <span>{item.label}</span>
              {Boolean(visit[item.key as keyof SiteVisit]) ? <Check className="text-green-600 transition" size={18} /> : null}
            </label>
          ))}
          <textarea
            rows={3}
            value={visit.travel_notes ?? ''}
            onChange={(e) => void updateVisit({ travel_notes: e.target.value || null })}
            placeholder="Travel notes"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div id="print-itinerary" className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900">Day-of Schedule</h2>
          <div className="flex gap-2">
            <button type="button" onClick={useStandardTemplate} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700">Use Standard Template</button>
            <button type="button" onClick={() => setAddBlockOpen((prev) => !prev)} className="min-h-11 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white">Add Block</button>
          </div>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              {editingScheduleId === item.id ? (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <input className="rounded border border-slate-300 px-2 py-1" value={item.time} onChange={(e) => void updateVisit({ schedule: schedule.map((block) => block.id === item.id ? { ...block, time: e.target.value } : block) })} />
                  <input className="rounded border border-slate-300 px-2 py-1" value={item.activity} onChange={(e) => void updateVisit({ schedule: schedule.map((block) => block.id === item.id ? { ...block, activity: e.target.value } : block) })} />
                  <input className="rounded border border-slate-300 px-2 py-1" value={item.location} onChange={(e) => void updateVisit({ schedule: schedule.map((block) => block.id === item.id ? { ...block, location: e.target.value } : block) })} />
                  <input className="rounded border border-slate-300 px-2 py-1" value={item.attendees} onChange={(e) => void updateVisit({ schedule: schedule.map((block) => block.id === item.id ? { ...block, attendees: e.target.value } : block) })} />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <p className="font-semibold text-slate-900">{item.time}</p>
                  <p>{item.activity}</p>
                  <p>{item.location}</p>
                  <p>{item.attendees}</p>
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setEditingScheduleId(editingScheduleId === item.id ? null : item.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">{editingScheduleId === item.id ? 'Done' : 'Edit'}</button>
                <button type="button" onClick={() => void deleteScheduleBlock(item.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 size={12} />Delete</button>
              </div>
            </div>
          ))}
          {schedule.length === 0 ? <p className="text-sm text-slate-500">No schedule blocks yet.</p> : null}
        </div>

        {addBlockOpen ? (
          <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
            <input placeholder="Time" value={newBlock.time} onChange={(e) => setNewBlock((prev) => ({ ...prev, time: e.target.value }))} className="rounded border border-slate-300 px-2 py-1" />
            <input placeholder="Activity" value={newBlock.activity} onChange={(e) => setNewBlock((prev) => ({ ...prev, activity: e.target.value }))} className="rounded border border-slate-300 px-2 py-1" />
            <input placeholder="Location" value={newBlock.location} onChange={(e) => setNewBlock((prev) => ({ ...prev, location: e.target.value }))} className="rounded border border-slate-300 px-2 py-1" />
            <input placeholder="Attendees" value={newBlock.attendees} onChange={(e) => setNewBlock((prev) => ({ ...prev, attendees: e.target.value }))} className="rounded border border-slate-300 px-2 py-1" />
            <div className="md:col-span-4">
              <button type="button" onClick={() => void addScheduleBlock()} className="min-h-11 rounded-lg bg-green-600 px-3 text-sm font-semibold text-white">Save Block</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900">People to Notify</h2>
          <div className="flex gap-2">
            <button type="button" onClick={addStandardPeople} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700">Add Standard List</button>
            <button type="button" onClick={() => setAddPersonOpen((prev) => !prev)} className="min-h-11 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white">Add Person</button>
          </div>
        </div>

        <div className="space-y-2">
          {notifyList.map((person) => (
            <label key={person.id} className={`flex items-center justify-between rounded-lg border p-3 ${person.notified ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
              <div>
                <p className="font-medium text-slate-900">{person.name}</p>
                <p className="text-sm text-slate-600">{person.role}</p>
                {person.notified && person.notified_at ? <p className="text-xs text-green-700">Notified: {new Date(person.notified_at).toLocaleString()}</p> : null}
              </div>
              <input type="checkbox" checked={person.notified} onChange={() => void toggleNotify(person.id)} className="h-5 w-5" />
            </label>
          ))}
        </div>

        {addPersonOpen ? (
          <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
            <input placeholder="Name" value={newPerson.name} onChange={(e) => setNewPerson((prev) => ({ ...prev, name: e.target.value }))} className="rounded border border-slate-300 px-2 py-1" />
            <input placeholder="Role" value={newPerson.role} onChange={(e) => setNewPerson((prev) => ({ ...prev, role: e.target.value }))} className="rounded border border-slate-300 px-2 py-1" />
            <div className="md:col-span-2">
              <button type="button" onClick={() => void addPerson()} className="min-h-11 rounded-lg bg-green-600 px-3 text-sm font-semibold text-white">Save Person</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-slate-900"><ClipboardList size={20} /> Pre-Visit Checklist</h2>
        <div className="space-y-2 text-sm">
          {[
            ['Visit dates set', checklist.items[0]],
            ['Flight booked', checklist.items[1]],
            ['Hotel reserved', checklist.items[2]],
            ['Schedule has at least 3 blocks', checklist.items[3]],
            ['All key people notified', checklist.items[4]],
          ].map(([label, done]) => <p key={String(label)}>{done ? '✅' : '❌'} {label}</p>)}
          <label className="block"><input type="checkbox" checked={manualChecklist.itinerarySent} onChange={(e) => setManualChecklist((prev) => ({ ...prev, itinerarySent: e.target.checked }))} className="mr-2" /> {manualChecklist.itinerarySent ? '✅' : '❌'} Itinerary sent to candidate</label>
          <label className="block"><input type="checkbox" checked={manualChecklist.welcomePacket} onChange={(e) => setManualChecklist((prev) => ({ ...prev, welcomePacket: e.target.checked }))} className="mr-2" /> {manualChecklist.welcomePacket ? '✅' : '❌'} Welcome packet prepared</label>
          <label className="block"><input type="checkbox" checked={manualChecklist.compensationReady} onChange={(e) => setManualChecklist((prev) => ({ ...prev, compensationReady: e.target.checked }))} className="mr-2" /> {manualChecklist.compensationReady ? '✅' : '❌'} Compensation package ready</label>
        </div>
      </div>

      {visit.status === 'completed' ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Post-Visit</h2>
          <p className="mb-3 text-base text-slate-700">How did it go?</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ['hot', '🔥 Hot'],
              ['warm', '👍 Warm'],
              ['lukewarm', '😐 Lukewarm'],
              ['not_a_fit', '❌ Not a Fit'],
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => void updateVisit({ visit_rating: value as SiteVisit['visit_rating'] })} className={`min-h-14 rounded-lg border px-3 text-sm font-semibold ${visit.visit_rating === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <textarea rows={4} value={visit.visit_notes ?? ''} onChange={(e) => void updateVisit({ visit_notes: e.target.value || null })} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Post-visit notes" />
          {visit.visit_rating ? (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              Suggested next step:{' '}
              {visit.visit_rating === 'hot' ? (
                <a href="/email" className="font-semibold underline">Draft an offer letter</a>
              ) : null}
              {visit.visit_rating === 'warm' ? 'Schedule follow-up call in 3 days' : null}
              {visit.visit_rating === 'lukewarm' ? 'Send thank you email, revisit in 2 weeks' : null}
              {visit.visit_rating === 'not_a_fit' ? 'Send graceful close email, move to Closed/Lost' : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <button type="button" className="hidden"><Calendar /></button>
    </section>
  );
}
