import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ArchiveSearch } from './pages/ArchiveSearch';
import { SubmitProject } from './pages/SubmitProject';
import LoginPage from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { PendingLaws } from './pages/PendingLaws';
import { Settings } from './pages/Settings';
import { Legislators } from './pages/Legislators';
import { Profile } from './pages/Profile';
import { DashboardLayout } from './components/DashboardLayout';
import { ThemeProvider } from './components/ui/theme-provider';
import PrivateRoute from './components/PrivateRoute';

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      {!isLoginPage && !isDashboardRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/archive-search" element={<ArchiveSearch />} />
          <Route path="/submit-project" element={<SubmitProject />} />
          
          {/* Dashboard Routes protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="submit-law" element={<SubmitProject />} />
              <Route path="pending-laws" element={<PendingLaws />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="legislators" element={<Legislators />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="portal-theme">
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}