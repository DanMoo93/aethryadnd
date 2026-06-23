import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CampaignDetail from './pages/CampaignDetail';
import CharacterSheet from './pages/CharacterSheet';
import ScenePage from './pages/ScenePage';
import CharacterWizard from './components/wizard/CharacterWizard';
import GMApprovals from './components/GMApprovals';
import AppLayout from './components/AppLayout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading…</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns/:campaignId"
            element={
              <PrivateRoute>
                <AppLayout><CampaignDetail /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/characters/:characterId"
            element={
              <PrivateRoute>
                <AppLayout><CharacterSheet /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/scenes/:sceneId"
            element={
              <PrivateRoute>
                <AppLayout><ScenePage /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns/:campaignId/new-character"
            element={
              <PrivateRoute>
                <AppLayout><CharacterWizard /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns/:campaignId/pending-characters"
            element={
              <PrivateRoute>
                <AppLayout><GMApprovals /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
