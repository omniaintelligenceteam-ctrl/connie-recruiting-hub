import { FileText, ExternalLink } from 'lucide-react';
import type { Candidate } from '../../../lib/database.types';

type DocSectionProps = {
  candidate: Candidate;
};

export default function DocSection({ candidate }: DocSectionProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" />
          Document Storage
        </h2>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">CV / Resume</p>
        
        {candidate.cv_file_url ? (
          <a
            href={candidate.cv_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FileText size={18} />
            View CV
            <ExternalLink size={14} />
          </a>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <FileText size={18} />
            <span>No CV uploaded yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
