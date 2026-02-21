import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { driverService } from '../api/services';
import { getPermissions } from '../config/roleConfig';
import DataTable from '../components/ui/DataTable';
import StatusChip from '../components/ui/StatusChip';
import Drawer from '../components/ui/Drawer';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/calculations';
import { Users, Plus, UserCheck, Navigation, AlertTriangle, Shield } from 'lucide-react';

export default function Drivers() {
  const { drivers, refresh, showToast, user } = useFleet();
  const perms = getPermissions(user?.role);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState({ name: '', licenseNo: '', licenseExpiry: '', category: 'Truck', phone: '', status: 'On Duty' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const openAdd = () => { setForm({ name: '', licenseNo: '', licenseExpiry: '', category: 'Truck', phone: '', status: 'On Duty' }); setEditId(null); setError(''); setDrawer('form'); };
  const openEdit = (d) => { setForm(d); setEditId(d.id); setError(''); setDrawer('form'); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.licenseNo || !form.licenseExpiry) {
      setError('Please fill in required fields'); return;
    }
    if (editId) {
      driverService.update(editId, form);
      showToast('Driver updated');
    } else {
      driverService.create(form);
      showToast('Driver added');
    }
    refresh();
    setDrawer(null);
  };

  const toggleStatus = (d, newStatus) => {
    driverService.updateStatus(d.id, newStatus);
    refresh();
    showToast(`${d.name} set to ${newStatus}`);
  };

  const isExpired = (d) => new Date(d.licenseExpiry) < new Date();
  const isExpiringSoon = (d) => {
    const exp = new Date(d.licenseExpiry);
    const now = new Date();
    const days = (exp - now) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 30;
  };

  const columns = [
    { key: 'name', label: 'Driver', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { key: 'licenseNo', label: 'License No', render: (r) => <span className="mono" style={{ fontSize: '0.75rem' }}>{r.licenseNo}</span> },
    {
      key: 'licenseExpiry', label: 'License Expiry', render: (r) => (
        <span style={{ color: isExpired(r) ? 'var(--status-error)' : isExpiringSoon(r) ? 'var(--status-warning)' : 'var(--text-primary)' }}>
          {formatDate(r.licenseExpiry)}
          {isExpired(r) && <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--status-error)' }}>EXPIRED</span>}
          {isExpiringSoon(r) && <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--status-warning)' }}>Expiring soon</span>}
        </span>
      )
    },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    {
      key: 'safetyScore', label: 'Safety', render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border-color)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${r.safetyScore}%`,
              background: r.safetyScore >= 80 ? 'var(--status-success)' : r.safetyScore >= 60 ? 'var(--status-warning)' : 'var(--status-error)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 28 }}>{r.safetyScore}%</span>
        </div>
      )
    },
    { key: 'tripsCompleted', label: 'Trips', render: (r) => <span className="mono">{r.tripsCompleted}/{r.tripsAssigned}</span> },
    ...((perms.canEditDriver || perms.canToggleDriverStatus) ? [{
      key: 'actions', label: '', sortable: false, render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', opacity: 0.7 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        >
          {perms.canEditDriver && <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</button>}
          {perms.canToggleDriverStatus && (
            <>
              {r.status === 'On Duty' && <button className="btn btn-sm" style={{ background: 'var(--status-neutral-bg)', color: 'var(--status-neutral)', border: 'none' }} onClick={e => { e.stopPropagation(); toggleStatus(r, 'Off Duty'); }}>Off Duty</button>}
              {r.status === 'Off Duty' && <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); toggleStatus(r, 'On Duty'); }}>On Duty</button>}
              {r.status !== 'Suspended' && r.status !== 'On Trip' && <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); toggleStatus(r, 'Suspended'); }}>Suspend</button>}
              {r.status === 'Suspended' && <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); toggleStatus(r, 'On Duty'); }}>Reinstate</button>}
            </>
          )}
        </div>
      )
    }] : []),
  ];

  const onDuty = drivers.filter(d => d.status === 'On Duty').length;
  const onTrip = drivers.filter(d => d.status === 'On Trip').length;
  const expired = drivers.filter(d => isExpired(d)).length;
  const avgSafety = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0;

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1><Users size={24} /> Driver Profiles</h1>
        {perms.canAddDriver && <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Driver</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard icon={UserCheck} label="On Duty" value={onDuty} sub="Active drivers" />
        <StatCard icon={Navigation} label="On Trip" value={onTrip} sub="Currently driving" />
        <StatCard icon={AlertTriangle} label="Expired Licenses" value={expired} sub="Need renewal" />
        <StatCard icon={Shield} label="Avg Safety" value={`${avgSafety}%`} sub="Fleet average" />
      </div>

      <DataTable columns={columns} data={drivers} emptyMessage="No drivers registered" />

      <Drawer open={drawer === 'form'} onClose={() => setDrawer(null)} title={editId ? 'Edit Driver' : 'Add New Driver'}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-input" placeholder="Driver name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>License Number *</label>
              <input className="form-input" placeholder="GJ0120210012345" value={form.licenseNo} onChange={e => setForm({ ...form, licenseNo: e.target.value })} />
            </div>
            <div className="form-group">
              <label>License Expiry *</label>
              <input className="form-input" type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option>Truck</option><option>Van</option><option>Bike</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>On Duty</option><option>Off Duty</option><option>Suspended</option>
              </select>
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Driver'}</button>
          </div>
        </form>
      </Drawer>
    </motion.div>
  );
}
