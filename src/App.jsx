import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { CollectionPage } from "./pages/CollectionPage";
import { ComposePage } from "./pages/ComposePage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SpotlightPage } from "./pages/SpotlightPage";
import { TrendingPage } from "./pages/TrendingPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppShell><div className="mahfil-card px-6 py-5 text-text-soft">Sabr kijiye...</div></AppShell>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <AppShell>
            <FeedPage />
          </AppShell>
        }
      />
      <Route
        path="/trending"
        element={
          <AppShell>
            <TrendingPage />
          </AppShell>
        }
      />
      <Route
        path="/compose"
        element={
          <ProtectedRoute>
            <AppShell>
              <ComposePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/u/:penName"
        element={
          <AppShell>
            <ProfilePage />
          </AppShell>
        }
      />
      <Route
        path="/diwan/:id"
        element={
          <AppShell>
            <CollectionPage />
          </AppShell>
        }
      />
      <Route
        path="/spotlight"
        element={
          <AppShell>
            <SpotlightPage />
          </AppShell>
        }
      />
    </Routes>
  );
}
