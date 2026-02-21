import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { maintenanceService } from '../api/services';
import { getPermissions, isReadOnly } from '../config/roleConfig';
import DataTable from '../components/ui/DataTable';
import StatusChip from '../components/ui/StatusChip';
import Drawer from '../components/ui/Drawer';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency } from '../utils/calculations';
import { Wrench, Plus, ClipboardList, CheckCircle2, DollarSign } from 'lucide-react';

const serviceTypes = ['Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'AC Service', 'Battery Replacement', 'Full Overhaul', 'Body Work', 'Electrical', 'Other'];

export default function Maintenance() {
  const { vehicles, maintenance, refresh, showToast, user } = useFleet();
  const perms = getPermissions(user?.role);
  const readOnly = isReadOnly(user?.role, '/maintenance');
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', serviceType: 'Oil Change', cost: '', date: '', technician: '', notes: '' });
  const [error, setError] = useState('');

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const availableForMaint = vehicles.filter(v => v.status !== 'Retired');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vehicleId || !form.cost || !form.date) {
      setError('Please fill in required fields'); return;
    }
    maintenanceService.create({ ...form, cost: Number(form.cost) });
    refresh();
    showToast('Service log added — vehicle moved to "In Shop"');
    setDrawer(false);
    setForm({ vehicleId: '', serviceType: 'Oil Change', cost: '', date: '', technician: '', notes: '' });
  };

  const handleComplete = (log) => {
    maintenanceService.complete(log.id);
    refresh();
    showToast('Service completed — vehicle returned to "Available"');
  };

  const columns = [
    { key: 'id', label: 'ID', render: (r) => <span className="mono" style={{ color: 'var(--brand-primary)', fontSize: '0.8rem' }}>{r.id}</span> },
    { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleMap[r.vehicleId]?.name || r.vehicleId },
    { key: 'serviceType', label: 'Service Type' },
    { key: 'cost', label: 'Cost', render: (r) => <span className="mono">{formatCurrency(r.cost)}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'technician', label: 'Technician' },
    { key: 'completed', label: 'Status', render: (r) => <StatusChip status={r.completed ? 'Completed' : 'In Shop'} /> },
    ...(perms.canCompleteMaintenance ? [{
      key: 'actions', label: '', sortable: false, render: (r) => (
        !r.completed ? (
          <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); handleComplete(r); }}>Mark Complete</button>
        ) : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Done</span>
      )
    }] : []),
  ];

  const openLogs = maintenance.filter(m => !m.completed).length;
  const completedLogs = maintenance.filter(m => m.completed).length;
  const totalCost = maintenance.reduce((s, m) => s + m.cost, 0);

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1>
          <Wrench size={24} /> Maintenance Logs
          {readOnly && <span style={{ fontSize: '0.7rem', fontWeight: 600, marginLeft: 10, padding: '3px 8px', borderRadius: 12, background: 'var(--status-info-bg)', color: 'var(--status-info)' }}>View Only</span>}
        </h1>
        {perms.canLogMaintenance && (
          <button className="btn btn-primary" onClick={() => { setDrawer(true); setError(''); }}>
            <Plus size={15} /> Add Service Log
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard icon={ClipboardList} label="Open Logs" value={openLogs} sub="Awaiting completion" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedLogs} sub="Service finished" />
        <StatCard icon={DollarSign} label="Total Cost" value={formatCurrency(totalCost)} sub="All maintenance" />
      </div>

      <DataTable columns={columns} data={[...maintenance].reverse()} emptyMessage="No service logs" />

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Add Service Log">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vehicle *</label>
            <select className="form-select" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle...</option>
              {availableForMaint.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Service Type *</label>
              <select className="form-select" value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                {serviceTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cost *</label>
              <input className="form-input" type="number" placeholder="0" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Technician</label>
              <input className="form-input" placeholder="Service center" value={form.technician} onChange={e => setForm({ ...form, technician: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input className="form-input" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Log</button>
          </div>
        </form>
      </Drawer>
    </motion.div>
  );
}
