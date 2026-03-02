import { useState } from 'react';
import { Shield, FileCheck } from 'lucide-react';
import { useToast } from '../../shared/Toast';
import type { Candidate } from '../../../lib/database.types';
import { supabase } from '../../../lib/supabase';

type NPDBSectionProps = {
  candidate: Candidate;
  onUpdate: () => void;
};

const NPDB_STATUSES = ['Request', 'Pending', 'Received', 'Clean', 'Flagged'];

export default function NPDBSection({ candidate, onUpdate }: NPDBSectionProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    npdb_status: candidate.npdb_status,
    npdb_report_date: candidate.npdb_report_date,
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          npdb_status: formData.npdb_status,
          npdb_report_date: formData.npdb_report_date,
        })
        .eq('id', candidate.id);

      if (error) throw error;

      showToast('Background check information updated', 'success');
      setEditing(false);
      onUpdate();
    } catch {
      showToast('Failed to update background check', 'error');
    }
  };

  const isReceived = ['Received', 'Clean', 'Flagged'].includes(
    candidate.npdb_status || ''
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Shield size={20} className="text-amber-600" />
          Background Check (NPDB)
        </h2>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                NPDB Status
              </label>
              <select
                value={formData.npdb_status || ''}
                onChange={(e) => setFormData({ ...formData, npdb_status: e.target.value || null })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Select status...</option>
                {NPDB_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Report Date
              </label>
              <input
                type="date"
                disabled={!formData.npdb_status || 
                  !['Received', 'Clean', 'Flagged'].includes(formData.npdb_status)}
                value={formData.npdb_report_date?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, npdb_report_date: e.target.value || null })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">NPDB Status</p>
              <div className="flex items-center gap-2">
                <FileCheck size={16} className={`${
                  candidate.npdb_status === 'Clean' ? 'text-green-600' :
                  candidate.npdb_status === 'Flagged' ? 'text-red-600' :
                  candidate.npdb_status ? 'text-amber-600' : 'text-slate-400'
                }`} />
                <p className="font-medium text-slate-900">
                  {candidate.npdb_status || 'Not started'}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Report Date</p>
              <p className="font-medium text-slate-900">
                {candidate.npdb_report_date
                  ? new Date(candidate.npdb_report_date).toLocaleDateString()
                  : isReceived ? 'No date recorded' : 'Not received yet'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
