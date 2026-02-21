import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Truck, Navigation, Wrench, DollarSign,
  Users, BarChart3, Settings, PanelLeftClose, PanelLeftOpen,
  LogOut, Zap,
} from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import { getRoleConfig } from '../config/roleConfig';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Vehicles', icon: Truck },
  { path: '/trips', label: 'Trips', icon: Navigation },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/expenses', label: 'Expenses', icon: DollarSign },
  { path: '/drivers', label: 'Drivers', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/user-management', label: 'Users', icon: Settings },
];

const COLLAPSED_KEY = 'fleetflow-sidebar-collapsed';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout } = useFleet();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const config = getRoleConfig(user?.role);
  const visibleItems = NAV_ITEMS.filter(item => config.sidebarItems.includes(item.path));

  const isMobile = window.innerWidth <= 767;

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{
          width: isMobile ? 260 : (collapsed ? 64 : 220),
          x: isMobile ? (mobileMenuOpen ? 0 : -260) : 0
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column',
          zIndex: 100,
          overflow: 'hidden',
          boxShadow: isMobile && mobileMenuOpen ? 'var(--shadow-lg)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '16px 12px' : '16px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border-color)',
          minHeight: 56,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                FleetFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '9px 14px',
                  margin: collapsed ? '2px 8px' : '2px 8px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--status-success-bg)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  transition: 'all 150ms ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {(!collapsed || isMobile) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle (Hide on Mobile) */}
        {!isMobile && (
          <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10, padding: '8px 10px',
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                borderRadius: 8, fontSize: '0.75rem', fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        )}

        {/* User profile */}
        <div style={{
          padding: (collapsed && !isMobile) ? '10px 8px' : '10px 14px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-moss)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)',
            flexShrink: 0,
          }}>
            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          {(!collapsed || isMobile) && (
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.role || 'Role'}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              padding: 4, borderRadius: 6, display: 'flex',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--status-error)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </motion.aside>
    </>
  );
}
