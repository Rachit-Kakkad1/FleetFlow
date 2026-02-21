import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { userService } from '../api/services';
import { getPermissions, ROLES } from '../config/roleConfig';
import Drawer from '../components/ui/Drawer';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import { Settings, Plus, Users, Trash2, Key, Lock } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config/emailConfig';

export default function UserManagement() {
  const { user, showToast } = useFleet();
  const permissions = getPermissions(user?.role);
  const [users, setUsers] = useState(() => userService.getAll());
  const [drawer, setDrawer] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES.DISPATCHER });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!permissions.canManageUsers) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <Lock size={48} strokeWidth={1.5} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p>You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const refreshUsers = () => setUsers(userService.getAll());

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.email || !form.password) { setFormError('All fields are required'); return; }
    if (form.password.length < 6) { setFormError('Password must be at least 6 characters'); return; }

    const result = userService.create(form);
    if (result.error) { setFormError(result.error); return; }

    setSending(true);
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_name: form.name, to_email: form.email, user_email: form.email,
        user_password: form.password, user_role: form.role, from_name: 'FleetFlow ERP',
      }, EMAILJS_PUBLIC_KEY);
      showToast(`User created & credentials emailed to ${form.email}`, 'success');
    } catch {
      showToast('User created but email failed. Share credentials manually.', 'warning');
    }
    setSending(false);
    setForm({ name: '', email: '', password: '', role: ROLES.DISPATCHER });
    setDrawer(false);
    refreshUsers();
  };

  const handleDelete = (id) => {
    userService.delete(id);
    refreshUsers();
    setDeleteConfirm(null);
    showToast('User deleted', 'success');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pw = '';
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, password: pw });
  };

  const roleChip = (role) => {
    const config = {
      'Fleet Manager': 'status-info',
      'Dispatcher': 'available',
      'Safety Officer': 'in-shop',
      'Financial Analyst': 'dispatched',
    };
    return <span className={`status-chip ${config[role] || 'draft'}`}>{role}</span>;
  };

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1><Settings size={24} /> User Management</h1>
        <button className="btn btn-primary" onClick={() => setDrawer(true)}>
          <Plus size={15} /> Create User
        </button>
      </div>

      {/* Role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard icon={Users} label="Total Users" value={users.length} />
        {Object.values(ROLES).map(role => (
          <StatCard key={role} label={role + 's'} value={users.filter(u => u.role === role).length} />
        ))}
      </div>

      {/* Users Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users registered</td></tr>
            ) : users.map(u => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <td data-label="Name">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--color-moss)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700,
                    }}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td data-label="Email" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td data-label="Role">{roleChip(u.role)}</td>
                <td data-label="Created" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.createdAt}</td>
                <td data-label="Actions">
                  {deleteConfirm === u.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Confirm</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteConfirm(u.id)}
                      style={{ opacity: 0.7 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Create New User">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleCreate}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" placeholder="user@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ flex: 1 }} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={generatePassword} title="Generate password">
                <Key size={13} /> Generate
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Create & Send Email'}
            </button>
          </div>
        </form>
      </Drawer>
    </motion.div>
  );
}
