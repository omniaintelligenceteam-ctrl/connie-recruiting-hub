import { useEffect, useState } from 'react';
import { useInteractions } from '../../hooks/useInteractions';
import { INTERACTION_TYPES } from '../../lib/constants';
import type { Interaction } from '../../lib/database.types';
import { useToast } from '../shared/Toast';

type LogInteractionProps = {
  candidateId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialType?: Interaction['type'];
};

export default function LogInteraction({
  candidateId,
  open,
  onClose,
  onSaved,
  initialType = 'Phone Call',
}: LogInteractionProps) {
  const { addInteraction, loading } = useInteractions();
  const { showToast } = useToast();
  const [type, setType] = useState<Interaction['type']>(initialType);
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [contactDate, setContactDate] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (open) {
      setType(initialType);
      setSummary('');
      setDetails('');
      setContactDate(new Date().toISOString().slice(0, 16));
    }
  }, [open, initialType]);

  if (!open) return null;

  const handleSave = async () => {
    if (!summary.trim()) {
      showToast('Summary is required.', 'error');
      return;
    }

    try {
      await addInteraction({
        candidate_id: candidateId,
        type,
        summary: summary.trim(),
        details: details.trim() || null,
        contact_date: new Date(contactDate).toISOString(),
      });
      showToast('Interaction saved.', 'success');
      onSaved();
      onClose();
    } catch {
      showToast('Could not save interaction.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-slate-900">Log Interaction</h3>

        <div className="space-y-4">
          <label className="block space-y-2 text-base font-medium text-slate-700">
            Interaction type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as Interaction['type'])}
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
            >
              {INTERACTION_TYPES.map((interactionType) => (
                <option key={interactionType} value={interactionType}>
                  {interactionType}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-base font-medium text-slate-700">
            Summary *
            <input
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
            />
          </label>

          <label className="block space-y-2 text-base font-medium text-slate-700">
            Details
            <textarea
              rows={4}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            />
          </label>

          <label className="block space-y-2 text-base font-medium text-slate-700">
            Date
            <input
              type="datetime-local"
              value={contactDate}
              onChange={(event) => setContactDate(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg border border-slate-300 px-4 text-base font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                void handleSave();
              }}
              className="min-h-11 rounded-lg bg-green-600 px-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-green-300"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
