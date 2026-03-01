import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Candidate } from '../../lib/database.types';
import CandidateCard from './CandidateCard';

type PipelineColumnProps = {
  stage: string;
  candidates: Candidate[];
  onDrop: (candidateId: string, targetStage: string) => void;
  onCandidateClick: (candidate: Candidate) => void;
};

export default function PipelineColumn({ stage, candidates, onDrop, onCandidateClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      onDragOver={(event) => {
        const id = event.dataTransfer?.getData('text/plain');
        if (id) {
          onDrop(id, stage);
        }
      }}
      className={`w-full rounded-xl bg-slate-100 p-3 transition md:w-[220px] md:min-w-[220px] ${
        isOver ? 'ring-2 ring-blue-300' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-800">{stage}</h3>
        <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-sm font-semibold text-slate-700">
          {candidates.length}
        </span>
      </div>

      <SortableContext items={candidates.map((candidate) => candidate.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} onClick={onCandidateClick} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
