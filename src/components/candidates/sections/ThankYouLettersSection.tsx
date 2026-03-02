import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '../../shared/Toast';
import type { ThankYouLetter, InsertThankYouLetter } from '../../../lib/database.types';
import { supabase } from '../../../lib/supabase';

type ThankYouLettersSectionProps = {
  candidateId: string;
};

const LETTER_TYPES = ['Physician', 'Administrator', 'Coordinator', 'Hospital Staff'];

export default function ThankYouLettersSection({ candidateId }: ThankYouLettersSectionProps) {
  const { showToast } = useToast();
  const [letters, setLetters] = useState<ThankYouLetter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<InsertThankYouLetter>({
    candidate_id: candidateId,
    recipient_name: '',
    recipient_role: '',
    sent_date: new Date().toISOString().split('T')[0],
    letter_type: 'Physician',
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('thank_you_letters')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('sent_date', { ascending: false });

      if (error) throw error;
      setLetters((data || []) as ThankYouLetter[]);
    } catch {
      showToast('Failed to load thank you letters', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [candidateId]);

  const handleSave = async () => {
    if (!formData.recipient_name || !formData.recipient_role || !formData.sent_date) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('thank_you_letters')
        .insert(formData);

      if (error) throw error;

      showToast('Thank you letter logged', 'success');
      setShowModal(false);
      await fetchLetters();
      setFormData({
        candidate_id: candidateId,
        recipient_name: '',
        recipient_role: '',
        sent_date: new Date().toISOString().split('T')[0],
        letter_type: 'Physician',
      });
    } catch {
      showToast('Could not log thank you letter', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('thank_you_letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Thank you letter removed', 'success');
      setConfirmDelete(null);
      await fetchLetters();
    } catch {
      showToast('Could not remove thank you letter', 'error');
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-pink-600" />
          Thank You Letters
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Log Letter
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : letters.length === 0 ? (
        <p className="text-slate-500 text-sm">No thank you letters logged yet.</p>
      ) : (
        <div className="space-y-2">
          {letters.map((letter) => (
            <div
              key={letter.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">
                  {letter.recipient_name}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {letter.recipient_role} · {letter.letter_type}
                </p>
                <p className="text-xs text-slate-400">
                  Sent {new Date(letter.sent_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(letter.id)}
                className="ml-2 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Log Thank You Letter</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="e.g., Garry Weston"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Recipient Role *
                </label>
                <input
                  type="text"
                  value={formData.recipient_role}
                  onChange={(e) => setFormData({ ...formData, recipient_role: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="e.g., Compensation Specialist"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sent Date *
                  </label>
                  <input
                    type="date"
                    value={formData.sent_date}
                    onChange={(e) => setFormData({ ...formData, sent_date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Letter Type
                  </label>
                  <select
                    value={formData.letter_type || ''}
                    onChange={(e) => setFormData({ ...formData, letter_type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {LETTER_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Thank You Letter?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to remove this thank you letter record?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
