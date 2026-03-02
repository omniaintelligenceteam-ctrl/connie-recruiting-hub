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
        className="w-full cursor-grab rounded-xl bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md active:cursor-grabbing"
      >
        <p className="text-sm font-semibold text-slate-900">
          Dr. {candidate.first_name} {candidate.last_name}
        </p>
        <p className="mt-1 text-xs text-slate-500">{candidate.specialty}</p>
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
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    void fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return candidates;

    return candidates.filter((candidate) => {
      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      return (
        candidate.first_name.toLowerCase().includes(query) ||
        candidate.last_name.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        candidate.specialty.toLowerCase().includes(query)
      );
    });
  }, [candidates, searchQuery]);

  const groupedCandidates = useMemo(
    () =>
      STAGES.reduce<Record<string, Candidate[]>>((acc, stage) => {
        acc[stage] = filteredCandidates.filter((candidate) => candidate.stage === stage);
        return acc;
      }, {}),
    [filteredCandidates],
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

  const showStageSuggestion = (candidate: Candidate, targetStage: Candidate['stage']) => {
    if (targetStage === 'Phone Screen') {
      showToast('Great! Schedule a phone screen. Suggested: Send intro email first, then call in 2-3 days.', 'info');
      return;
    }


    if (targetStage === 'Site Visit') {
      showToast('Exciting! Ready to plan the site visit?', 'info', {
        label: 'Plan Site Visit',
        onClick: () => navigate(`/candidates/${candidate.id}/site-visit`),
      });
      return;
    }

    if (targetStage === 'Offer') {
      showToast('Almost there! Draft an offer using the Email Hub?', 'info', {
        label: 'Open Email Hub',
        onClick: () => navigate('/email', { state: { candidateId: candidate.id } }),
      });
      return;
    }

    if (targetStage === 'Accepted') {
      showToast(`🎉 Congratulations! ${candidate.first_name} is joining Baptist Health!`, 'success');
      return;
    }

    if (targetStage === 'Closed/Lost') {
      showToast('Sorry to hear. Would you like to note why they declined?', 'info');
    }
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    if (pendingMove.targetStage === 'Closed/Lost' && !lostReason.trim()) {
      showToast('Lost reason is required before closing as lost.', 'error');
      return;
    }

    const move = pendingMove;

    try {
      await updateCandidate(move.candidate.id, {
        stage: move.targetStage,
        lost_reason: move.targetStage === 'Closed/Lost' ? lostReason.trim() : null,
      });

      showStageSuggestion(move.candidate, move.targetStage);
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

  const searchBar = (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search doctors by name or specialty..."
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          ×
        </button>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        {searchBar}
        {STAGES.map((stage) => (
          <section key={stage} className="rounded-xl bg-slate-100/80 p-3">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold text-slate-700">{stage}</h3>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
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
                <p className="rounded-lg bg-white p-3 text-sm text-slate-500">
                  {searchQuery ? 'No matches' : 'No doctors in this stage yet.'}
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-3">{searchBar}</div>
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} sensors={sensors}>
        <div className="overflow-x-auto pb-2 scroll-smooth [scrollbar-gutter:stable]">
          <SortableContext items={[...STAGES]} strategy={horizontalListSortingStrategy}>
            <div className="flex min-w-max gap-2.5">
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
