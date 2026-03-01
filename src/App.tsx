import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ToastProvider } from './components/shared/Toast';
import AddCandidatePage from './pages/AddCandidatePage';
import AIAssistantPage from './pages/AIAssistantPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import DashboardPage from './pages/DashboardPage';
import EmailHubPage from './pages/EmailHubPage';
import PipelinePage from './pages/PipelinePage';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="candidates/new" element={<AddCandidatePage />} />
            <Route path="candidates/:id" element={<CandidateDetailPage />} />
            <Route path="email" element={<EmailHubPage />} />
            <Route path="ai" element={<AIAssistantPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
