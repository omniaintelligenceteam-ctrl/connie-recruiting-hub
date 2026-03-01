import { Navigate, useParams } from 'react-router-dom';
import SiteVisitPlanner from '../components/candidates/SiteVisitPlanner';

export default function SiteVisitPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/pipeline" replace />;
  }

  return <SiteVisitPlanner candidateId={id} />;
}
