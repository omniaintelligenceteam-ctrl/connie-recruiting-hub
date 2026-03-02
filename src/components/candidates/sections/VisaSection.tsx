import { useState } from 'react';
import { Check, X, Globe } from 'lucide-react';
import { useToast } from '../../shared/Toast';
import type { Candidate } from '../../../lib/database.types';
import { supabase } from '../../../lib/supabase';

type VisaSectionProps = {
  candidate: Candidate;
  onUpdate: () => void;
};

const VISA_STATUSES = ['J-1', 'H1B', 'Pending Lawyer Review', 'Approved', 'Denied'];

export default function VisaSection({ candidate, onUpdate }: VisaSectionProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    is_visa_candidate: candidate.is_visa_candidate,
    visa_status: candidate.visa_status,
    visa_approval_date: candidate.visa_approval_date,
    approved_by_immigration: candidate.approved_by_immigration,
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          is_visa_candidate: formData.is_visa_candidate,
          visa_status: formData.visa_status,
          visa_approval_date: formData.visa_approval_date,
        })
        .eq('id', candidate.id);

      if (error) throw error;

      showToast('Visa information updated', 'success');
      setEditing(false);
      onUpdate();
    } catch {
      showToast('Failed to update visa information', 'error');
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Globe size={20} className="text-blue-600" />
          Visa Candidate Information
        </h2>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Visa Candidate Toggle */}
        <div className="flex items-center gap-3">
          {editing ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_visa_candidate}
                onChange={(e) => setFormData({ ...formData, is_visa_candidate: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">This is a visa candidate</span>
            </label>
          ) : (
            <div className="flex items-center gap-2">
              {candidate.is_visa_candidate ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <X size={18} className="text-slate-400" />
              )}
              <span className={candidate.is_visa_candidate ? 'text-green-700 font-medium' : 'text-slate-500'}>
                {candidate.is_visa_candidate ? 'Visa candidate' : 'Not a visa candidate'}
              </span>
            </div>
          )}
        </div>

        {/* Visa Status - only show if visa candidate */}
        {(editing && formData.is_visa_candidate) || (!editing && candidate.is_visa_candidate) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Visa Status
                  </label>
                  <select
                    value={formData.visa_status || ''}
                    onChange={(e) => setFormData({ ...formData, visa_status: e.target.value || null })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select status...</option>
                    {VISA_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Immigration Lawyer Approval Date
                  </label>
                  <input
                    type="date"
                    value={formData.visa_approval_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, visa_approval_date: e.target.value || null })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Visa Status</p>
                  <p className="font-medium text-slate-900">{candidate.visa_status || 'Not set'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Approval Date</p>
                  <p className="font-medium text-slate-900">
                    {candidate.visa_approval_date
                      ? new Date(candidate.visa_approval_date).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Immigration Approval Status - Read Only */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            candidate.approved_by_immigration
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {candidate.approved_by_immigration ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            {candidate.approved_by_immigration ? 'Immigration Approved' : 'Immigration Pending'}
          </div>
        </div>
      </div>
    </div>
  );
}
