import { Navigate, useParams } from 'react-router-dom';
import CandidateProfile from '../components/candidates/CandidateProfile';

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/pipeline" replace />;
  }

  return <CandidateProfile candidateId={id} />;
}
