import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { FleetProvider, useFleet } from './context/FleetContext';
import { canAccessRoute } from './config/roleConfig';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Drivers from './pages/Drivers';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import './App.css';

function ProtectedLayout() {
  const { user } = useFleet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const collapsed = localStorage.getItem('fleetflow-sidebar-collapsed') === 'true';

  return (
    <div className="app-layout">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className={`main-content ${mobileMenuOpen ? 'mobile-blur' : ''}`} style={{
        marginLeft: window.innerWidth > 767 ? (collapsed ? 64 : 220) : 0,
        transition: 'margin-left 200ms ease',
        width: '100%',
        minWidth: 0,
      }}>
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </div>
    </div>
  );
}

function RoleRoute({ children, path }) {
  const { user } = useFleet();
  if (!user || !canAccessRoute(user.role, path)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function LoginGuard() {
  const { user } = useFleet();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

function LandingGuard() {
  const { user } = useFleet();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <FleetProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-lg)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingGuard />} />
          <Route path="/login" element={<LoginGuard />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<RoleRoute path="/vehicles"><Vehicles /></RoleRoute>} />
            <Route path="/trips" element={<RoleRoute path="/trips"><Trips /></RoleRoute>} />
            <Route path="/maintenance" element={<RoleRoute path="/maintenance"><Maintenance /></RoleRoute>} />
            <Route path="/expenses" element={<RoleRoute path="/expenses"><Expenses /></RoleRoute>} />
            <Route path="/drivers" element={<RoleRoute path="/drivers"><Drivers /></RoleRoute>} />
            <Route path="/analytics" element={<RoleRoute path="/analytics"><Analytics /></RoleRoute>} />
            <Route path="/user-management" element={<RoleRoute path="/user-management"><UserManagement /></RoleRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FleetProvider>
    </BrowserRouter>
  );
}
