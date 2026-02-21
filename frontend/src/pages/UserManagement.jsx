import { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { userService } from '../api/services';
import { getPermissions, ROLES } from '../config/roleConfig';
import Drawer from '../components/ui/Drawer';
import StatCard from '../components/ui/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Users, Trash2, Key, Lock, Mail, User, Shield } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config/emailConfig';

export default function UserManagement() {
  const { user, showToast } = useFleet();
  const permissions = getPermissions(user?.role);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DISPATCHER' });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await userService.getAll();
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (permissions.canManageUsers) {
      fetchUsers();
    }
  }, [permissions.canManageUsers]);

  if (!permissions.canManageUsers) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state"
          style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
        >
          <Lock size={64} color="var(--color-danger)" strokeWidth={1.5} style={{ marginBottom: 24, opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You lack the required Manager permissions to view or edit users.</p>
        </motion.div>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.email || !form.password) { setFormError('All fields are required'); return; }
    if (form.password.length < 6) { setFormError('Password must be at least 6 characters'); return; }

    const result = await userService.create(form);
    if (result.error) { setFormError(result.error); return; }

    setSending(true);
    try {
      if (typeof EMAILJS_SERVICE_ID !== 'undefined' && EMAILJS_SERVICE_ID) {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_name: form.name,
          to_email: form.email,
          login_email: form.email,
          temporary_password: form.password,
          password: form.password,
          login_url: window.location.origin + '/login',
          message: `Your FleetFlow account has been created! Your temporary password is: ${form.password}`
        }, EMAILJS_PUBLIC_KEY);
        showToast(`User created & credentials emailed to ${form.email}`, 'success');
      } else {
        showToast(`User created successfully. (Email skipped - No API key)`, 'success');
      }
    } catch {
      showToast('User created but email dispatch failed. Share credentials manually.', 'warning');
    }
    setSending(false);
    setForm({ name: '', email: '', password: '', role: 'DISPATCHER' });
    setDrawer(false);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    try {
      await userService.delete(id);
      showToast('User securely removed.', 'success');
      fetchUsers();
    } catch (e) {
      showToast('Failed to delete user.', 'error');
    }
    setDeleteConfirm(null);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pw = '';
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, password: pw });
  };

  const roleChip = (role) => {
    const config = {
      'MANAGER': 'status-info',
      'DISPATCHER': 'available',
      'SAFETY_OFFICER': 'in-shop',
      'FINANCIAL_ANALYST': 'dispatched',
    };
    return <span className={`status-chip ${config[role] || 'draft'}`}>{role.replace('_', ' ')}</span>;
  };

  return (
    <motion.div className="page-content" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem' }}>
            <Settings size={28} className="text-primary" />
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Control who has access to the FleetFlow dashboard and their operational boundaries.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDrawer(true)} style={{ boxShadow: '0 4px 14px rgba(0, 200, 150, 0.3)' }}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={Users} label="Total Users" value={users.length} />
        </motion.div>
        {Object.keys(ROLES).map((roleKey, idx) => (
          <motion.div key={roleKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (idx * 0.05) }}>
            <StatCard label={ROLES[roleKey]} value={users.filter(u => u.role === roleKey).length || 0} />
          </motion.div>
        ))}
      </div>

      {/* Users Table Card */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} className="text-primary" /> Active Personnel
          </h3>
        </div>
        <div className="data-table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>User Profile</th>
                <th>Security Level</th>
                <th>Date Joined</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading network personnel...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : (
                <AnimatePresence>
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, backgroundColor: 'rgba(255,0,0,0.05)' }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                    >
                      <td data-label="User Profile" style={{ paddingLeft: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(0, 200, 150, 0.1), rgba(0, 150, 255, 0.1))',
                            border: '1px solid rgba(0,0,0,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)'
                          }}>
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{u.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={10} /> {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Security Level">{roleChip(u.role)}</td>
                      <td data-label="Date Joined" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td data-label="Controls" style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        {deleteConfirm === u.id ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Confirm</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(u.id)}
                            style={{ color: 'var(--color-danger)', opacity: 0.6, padding: '6px 10px' }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,0,0,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.background = 'transparent'; }}
                            title="Revoke Access"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create User Drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Provision New User">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }} onSubmit={handleCreate}>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><User size={14} /> Full Legal Name</label>
            <input className="form-input" placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '0.75rem 1rem' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><Mail size={14} /> Corporate Email</label>
            <input type="email" className="form-input" placeholder="user@fleetflow.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: '0.75rem 1rem' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><Shield size={14} /> System Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ padding: '0.75rem 1rem' }}>
              {Object.entries(ROLES).map(([key, displayValue]) => <option key={key} value={key}>{displayValue}</option>)}
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>This role determines module access and approval capabilities.</p>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><Key size={14} /> Temporary Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="form-input" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ flex: 1, padding: '0.75rem 1rem' }} />
              <button type="button" className="btn btn-secondary" onClick={generatePassword} title="Generate strong password" style={{ padding: '0 1rem' }}>
                Auto
              </button>
            </div>
          </div>

          {formError && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="form-error" style={{ background: 'rgba(255,0,0,0.05)', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
              {formError}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(false)}>Cancel Dispatch</button>
            <button type="submit" className="btn btn-primary" disabled={sending} style={{ minWidth: 160 }}>
              {sending ? 'Provisioning...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Drawer>
    </motion.div>
  );
}
