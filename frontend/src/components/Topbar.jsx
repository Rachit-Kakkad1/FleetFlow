import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useFleet } from '../context/FleetContext';

const PAGE_NAMES = {
  '/dashboard': 'Command Center',
  '/vehicles': 'Vehicle Registry',
  '/trips': 'Trip Dispatcher',
  '/maintenance': 'Maintenance Logs',
  '/expenses': 'Expenses & Fuel',
  '/drivers': 'Driver Profiles',
  '/analytics': 'Analytics & Reports',
  '/user-management': 'User Management',
};

export default function Topbar({ setMobileMenuOpen }) {
  const location = useLocation();
  const { maintenance, user } = useFleet();
  const [showNotif, setShowNotif] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const pageName = PAGE_NAMES[location.pathname] || 'FleetFlow';
  const openAlerts = maintenance?.filter(m => !m.completed).length || 0;

  return (
    <header style={{
      position: 'sticky', top: 0,
      height: 'var(--topbar-height)',
      background: 'var(--bg-topbar)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 50,
    }}>
      {/* Search toggler + Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn-icon mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          style={{ width: 34, height: 34 }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }} className="desktop-only">FleetFlow /</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pageName}</span>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Search toggle */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                style={{
                  width: '100%', padding: '6px 10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem', outline: 'none',
                }}
                onBlur={() => setSearchOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button className="btn-icon" onClick={() => setSearchOpen(s => !s)} style={{ width: 34, height: 34 }}>
          {searchOpen ? <X size={16} /> : <Search size={16} />}
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setShowNotif(s => !s)}
            style={{ width: 34, height: 34 }}
          >
            <Bell size={16} />
            {openAlerts > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--status-warning)',
              }} />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '100%', right: 0,
                  marginTop: 8, width: 300,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden', zIndex: 200,
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  fontWeight: 600, fontSize: '0.8125rem',
                }}>
                  Notifications
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {openAlerts > 0 ? (
                    <div style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>{openAlerts}</span> open maintenance logs require attention.
                    </div>
                  ) : (
                    <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No new notifications
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-moss)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)',
          marginLeft: 4,
        }}>
          {user?.name?.slice(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
