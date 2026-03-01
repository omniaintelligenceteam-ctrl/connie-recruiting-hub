import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../../hooks/useCandidates';
import { STAGES } from '../../lib/constants';
import type { Candidate } from '../../lib/database.types';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useToast } from '../shared/Toast';
import PipelineColumn from './PipelineColumn';

type PendingMove = {
  candidate: Candidate;
  targetStage: Candidate['stage'];
};

type SortableCandidateCardProps = {
  candidate: Candidate;
  onClick: (candidate: Candidate) => void;
};

function SortableCandidateCard({ candidate, onClick }: SortableCandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        type="button"
        onClick={() => onClick(candidate)}
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-slate-900">
            Dr. {candidate.first_name} {candidate.last_name}
          </p>
        </div>
        <p className="text-sm text-slate-600">{candidate.specialty}</p>
      </button>
    </div>
  );
}

export default function PipelineBoard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { candidates, fetchCandidates, updateCandidate } = useCandidates();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [lostReason, setLostReason] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    void fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const groupedCandidates = useMemo(
    () =>
      STAGES.reduce<Record<string, Candidate[]>>((acc, stage) => {
        acc[stage] = candidates.filter((candidate) => candidate.stage === stage);
        return acc;
      }, {}),
    [candidates],
  );

  const findStageForCandidate = (candidateId: string) => candidates.find((item) => item.id === candidateId)?.stage;

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const sourceStage = findStageForCandidate(activeId);
    const targetStage = STAGES.includes(overId as Candidate['stage'])
      ? (overId as Candidate['stage'])
      : findStageForCandidate(overId);

    if (!sourceStage || !targetStage || sourceStage === targetStage) return;

    const candidate = candidates.find((item) => item.id === activeId);
    if (!candidate) return;

    setLostReason('');
    setPendingMove({ candidate, targetStage });
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    if (pendingMove.targetStage === 'Closed/Lost' && !lostReason.trim()) {
      showToast('Lost reason is required before closing as lost.', 'error');
      return;
    }

    try {
      await updateCandidate(pendingMove.candidate.id, {
        stage: pendingMove.targetStage,
        lost_reason: pendingMove.targetStage === 'Closed/Lost' ? lostReason.trim() : null,
      });

      if (pendingMove.targetStage === 'Contacted') {
        showToast('Want to draft an outreach email? Open /email', 'info');
      } else if (pendingMove.targetStage === 'Site Visit') {
        showToast('Send site visit invitation?', 'info');
      } else if (pendingMove.targetStage === 'Offer') {
        showToast('Check compensation benchmarks?', 'info');
      }

      setPendingMove(null);
      setLostReason('');
    } catch {
      showToast('Could not move candidate. Please try again.', 'error');
    }
  };

  const handleCancelMove = () => {
    setPendingMove(null);
    setLostReason('');
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {STAGES.map((stage) => (
          <section key={stage} className="rounded-xl bg-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">{stage}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-sm font-semibold text-slate-700">
                {groupedCandidates[stage]?.length ?? 0}
              </span>
            </div>

            <div className="space-y-2">
              {(groupedCandidates[stage] ?? []).map((candidate) => (
                <SortableCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onClick={(selected) => navigate(`/candidates/${selected.id}`)}
                />
              ))}
              {(groupedCandidates[stage] ?? []).length === 0 ? (
                <p className="rounded-lg bg-white p-3 text-sm text-slate-500">No doctors in this stage yet.</p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} sensors={sensors}>
        <div className="overflow-x-auto pb-2">
          <SortableContext items={[...STAGES]} strategy={horizontalListSortingStrategy}>
            <div className="flex min-w-max gap-3">
              {STAGES.map((stage) => (
                <PipelineColumn
                  key={stage}
                  stage={stage}
                  candidates={groupedCandidates[stage] ?? []}
                  onDrop={() => undefined}
                  onCandidateClick={(candidate) => navigate(`/candidates/${candidate.id}`)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>

      {pendingMove?.targetStage === 'Closed/Lost' ? (
        <div className="fixed inset-0 z-[54] flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-slate-900">Closed/Lost reason required</h3>
            <p className="mb-3 text-base text-slate-600">Please provide a reason before confirming.</p>
            <textarea
              rows={4}
              value={lostReason}
              onChange={(event) => setLostReason(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
              placeholder="Reason candidate was lost"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCancelMove}
                className="min-h-11 rounded-lg border border-slate-300 px-4 text-base font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingMove)}
        title="Confirm stage change"
        message={
          pendingMove
            ? `Move Dr. ${pendingMove.candidate.first_name} ${pendingMove.candidate.last_name} to ${pendingMove.targetStage}?`
            : ''
        }
        confirmLabel="Confirm move"
        onCancel={handleCancelMove}
        onConfirm={() => {
          void handleConfirmMove();
        }}
      />
    </>
  );
}
