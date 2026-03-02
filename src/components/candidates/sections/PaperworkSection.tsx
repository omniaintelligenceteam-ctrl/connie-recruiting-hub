import { useState } from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '../../shared/Toast';
import type { Candidate } from '../../../lib/database.types';
import { supabase } from '../../../lib/supabase';

type PaperworkSectionProps = {
  candidate: Candidate;
  onUpdate: () => void;
};

export default function PaperworkSection({ candidate, onUpdate }: PaperworkSectionProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    paperwork_sent_date: candidate.paperwork_sent_date,
    paperwork_received_date: candidate.paperwork_received_date,
    questionnaire_sent_date: candidate.questionnaire_sent_date,
    questionnaire_received_date: candidate.questionnaire_received_date,
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          paperwork_sent_date: formData.paperwork_sent_date,
          paperwork_received_date: formData.paperwork_received_date,
          questionnaire_sent_date: formData.questionnaire_sent_date,
          questionnaire_received_date: formData.questionnaire_received_date,
        })
        .eq('id', candidate.id);

      if (error) throw error;

      showToast('Tracking information updated', 'success');
      setEditing(false);
      onUpdate();
    } catch {
      showToast('Failed to update tracking information', 'error');
    }
  };

  const getStatus = (sent?: string | null, received?: string | null) => {
    if (!sent) return { label: 'Not sent', color: 'text-slate-400' };
    if (received) return { label: 'Received', color: 'text-green-600', icon: CheckCircle2 };
    return { label: 'Pending', color: 'text-amber-600', icon: Clock };
  };

  const paperworkStatus = getStatus(
    candidate.paperwork_sent_date,
    candidate.paperwork_received_date
  );
  const questionnaireStatus = getStatus(
    candidate.questionnaire_sent_date,
    candidate.questionnaire_received_date
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar size={20} className="text-violet-600" />
          Paperwork & Questionnaire Tracking
        </h2>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paperwork Tracking */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-600" />
            Paperwork
          </h3>
          
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sent Date</label>
                <input
                  type="date"
                  value={formData.paperwork_sent_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, paperwork_sent_date: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Received Date</label>
                <input
                  type="date"
                  value={formData.paperwork_received_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, paperwork_received_date: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Sent:</span>
                <span className="text-sm font-medium text-slate-900">
                  {candidate.paperwork_sent_date
                    ? new Date(candidate.paperwork_sent_date).toLocaleDateString()
                    : 'Not sent'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Received:</span>
                <span className="text-sm font-medium text-slate-900">
                  {candidate.paperwork_received_date
                    ? new Date(candidate.paperwork_received_date).toLocaleDateString()
                    : 'Not received'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
                {paperworkStatus.icon && <paperworkStatus.icon size={14} className={paperworkStatus.color} />}
                <span className={`text-xs font-medium ${paperworkStatus.color}`}>
                  {paperworkStatus.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire Tracking */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Questionnaire
          </h3>
          
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sent Date</label>
                <input
                  type="date"
                  value={formData.questionnaire_sent_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, questionnaire_sent_date: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Received Date</label>
                <input
                  type="date"
                  value={formData.questionnaire_received_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, questionnaire_received_date: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Sent:</span>
                <span className="text-sm font-medium text-slate-900">
                  {candidate.questionnaire_sent_date
                    ? new Date(candidate.questionnaire_sent_date).toLocaleDateString()
                    : 'Not sent'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Received:</span>
                <span className="text-sm font-medium text-slate-900">
                  {candidate.questionnaire_received_date
                    ? new Date(candidate.questionnaire_received_date).toLocaleDateString()
                    : 'Not received'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
                {questionnaireStatus.icon && <questionnaireStatus.icon size={14} className={questionnaireStatus.color} />}
                <span className={`text-xs font-medium ${questionnaireStatus.color}`}>
                  {questionnaireStatus.label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
