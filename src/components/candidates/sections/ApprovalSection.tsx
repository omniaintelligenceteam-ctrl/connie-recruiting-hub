import { CheckCircle, AlertCircle, Check, X } from 'lucide-react';
import type { Candidate } from '../../../lib/database.types';

type ApprovalSectionProps = {
  candidate: Candidate;
};

export default function ApprovalSection({ candidate }: ApprovalSectionProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          Approval Checkpoints
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Immigration Approval */}
        <div
          className={`rounded-lg p-4 flex items-center gap-3 ${
            candidate.approved_by_immigration
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          {candidate.approved_by_immigration ? (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">
              Immigration Approval
            </p>
            <p className={`text-sm ${
              candidate.approved_by_immigration ? 'text-green-700' : 'text-amber-700'
            }`}>
              {candidate.approved_by_immigration ? 'Approved' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Site Visit Readiness */}
        <div
          className={`rounded-lg p-4 flex items-center gap-3 ${
            candidate.approved_for_site_visit
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          {candidate.approved_for_site_visit ? (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <X size={20} className="text-amber-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">
              Site Visit Readiness
            </p>
            <p className={`text-sm ${
              candidate.approved_for_site_visit ? 'text-green-700' : 'text-amber-700'
            }`}>
              {candidate.approved_for_site_visit
                ? 'Ready for Site Visit'
                : 'Pending Approvals'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
