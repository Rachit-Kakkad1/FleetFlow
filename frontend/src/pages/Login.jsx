import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useFleet();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    const user = login(form.email, form.password);
    if (!user) {
      setError('Invalid email or password');
      return;
    }
    navigate('/dashboard');
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
          width: '100%', maxWidth: 400,
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
            Fleet & Logistics Management
          </p>
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
            style={{
              width: '100%', justifyContent: 'center',
              padding: '10px 20px', fontSize: '0.875rem',
              marginTop: 4,
            }}
          >
            Sign In <ArrowRight size={16} />
          </button>

          <p style={{
            fontSize: '0.7rem', color: 'var(--text-muted)',
            textAlign: 'center', marginTop: 4,
          }}>
            Default: manager@fleetflow.com / manager123
          </p>
        </form>
      </motion.div>
    </div>
  );
}
