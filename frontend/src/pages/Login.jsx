import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Eye, EyeOff, ArrowLeft, Shield, Radio, TrendingUp } from 'lucide-react';

const QUICK_LOGINS = [
  {
    label: 'Manager',
    icon: Zap,
    email: 'manager@fleet.com',
    password: 'manager123',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.25)',
  },
  {
    label: 'Dispatcher',
    icon: Radio,
    email: 'dispatcher@fleet.com',
    password: 'dispatch123',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    label: 'Safety Officer',
    icon: Shield,
    email: 'safety@fleet.com',
    password: 'safety123',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    label: 'Financial Analyst',
    icon: TrendingUp,
    email: 'analyst@fleet.com',
    password: 'analyst123',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useFleet();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      padding: 24,
      position: 'relative',
    }}>
      {/* Back to Home */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 24, left: 24,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '0.8125rem',
          fontWeight: 600,
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          transition: 'all 150ms ease',
          zIndex: 2,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--brand-primary)';
          e.currentTarget.style.color = 'var(--brand-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 16, padding: 32,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--brand-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Zap size={22} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>FleetFlow</h1>
          </Link>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Fleet &amp; Logistics Management
          </p>
        </div>

        {/* ── Quick Login Cards ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center',
          }}>
            Quick Login
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUICK_LOGINS.map(({ label, icon: Icon, email, password, color, bg, border }) => (
              <motion.button
                key={label}
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setForm({ email, password }); setError(''); }}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 8px', borderRadius: 12,
                  background: bg,
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color, lineHeight: 1.2, textAlign: 'center' }}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 2, display: 'flex',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%', justifyContent: 'center',
              padding: '10px 20px', fontSize: '0.875rem',
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing In...' : <>Sign In <ArrowRight size={16} /></>}
          </button>

          <p style={{
            fontSize: '0.7rem', color: 'var(--text-muted)',
            textAlign: 'center', marginTop: 4,
          }}>
            Select a role above or enter your credentials to continue.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
