import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import InterviewPrepSheet from '../components/candidates/InterviewPrepSheet';
import { useCandidates } from '../hooks/useCandidates';
import { useInteractions } from '../hooks/useInteractions';
import type { Candidate } from '../lib/database.types';
import { useToast } from '../components/shared/Toast';

export default function InterviewPrepPage() {
  const { id } = useParams<{ id: string }>();
  const { getCandidateById } = useCandidates();
  const { interactions, fetchInteractions, loading: interactionsLoading } = useInteractions();
  const { showToast } = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setCandidateLoading(true);

      try {
        const found = await getCandidateById(id);
        setCandidate(found);
        await fetchInteractions(id);
      } catch {
        showToast('Could not load interview prep data.', 'error');
      } finally {
        setCandidateLoading(false);
      }
    };

    void load();
  }, [fetchInteractions, getCandidateById, id, showToast]);

  if (!id) {
    return <Navigate to="/pipeline" replace />;
  }

  if (candidateLoading || interactionsLoading) {
    return <p className="text-base text-slate-600">Loading prep sheet...</p>;
  }

  if (!candidate) {
    return <p className="text-base text-slate-600">Candidate not found.</p>;
  }

  return <InterviewPrepSheet candidate={candidate} interactions={interactions} />;
}
