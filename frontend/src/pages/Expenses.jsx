import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { expenseService } from '../api/services';
import { getPermissions } from '../config/roleConfig';
import DataTable from '../components/ui/DataTable';
import Drawer from '../components/ui/Drawer';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency, calcTotalOperationalCost } from '../utils/calculations';
import { DollarSign, Plus, Wrench, Calculator } from 'lucide-react';

export default function Expenses() {
  const { vehicles, expenses, maintenance, trips, refresh, showToast, user } = useFleet();
  const perms = getPermissions(user?.role);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: 'Fuel', liters: '', cost: '', date: '', tripId: '' });
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('all');

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vehicleId || !form.cost || !form.date) {
      setError('Please fill in required fields'); return;
    }
    expenseService.create({ ...form, liters: Number(form.liters || 0), cost: Number(form.cost) });
    refresh();
    showToast('Expense recorded');
    setDrawer(false);
    setForm({ vehicleId: '', type: 'Fuel', liters: '', cost: '', date: '', tripId: '' });
  };

  const vehicleSummaries = vehicles.map(v => {
    const { fuelCost, maintCost, total } = calcTotalOperationalCost(v.id, expenses, maintenance);
    const tripCount = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed').length;
    return { ...v, fuelCost, maintCost, totalCost: total, tripCount };
  }).filter(v => v.totalCost > 0).sort((a, b) => b.totalCost - a.totalCost);

  const typeChip = (type) => {
    const config = {
      Fuel: { bg: 'var(--status-info-bg)', color: 'var(--status-info)' },
      Toll: { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
    };
    const c = config[type] || { bg: 'var(--status-neutral-bg)', color: 'var(--status-neutral)' };
    return <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color }}>{type}</span>;
  };

  const columns = [
    { key: 'id', label: 'ID', render: (r) => <span className="mono" style={{ color: 'var(--brand-primary)', fontSize: '0.8rem' }}>{r.id}</span> },
    { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleMap[r.vehicleId]?.name || r.vehicleId },
    { key: 'type', label: 'Type', render: (r) => typeChip(r.type) },
    { key: 'liters', label: 'Liters', render: (r) => r.liters > 0 ? <span className="mono">{r.liters} L</span> : '—' },
    { key: 'cost', label: 'Cost', render: (r) => <span className="mono">{formatCurrency(r.cost)}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'tripId', label: 'Trip', render: (r) => r.tripId ? <span className="mono" style={{ fontSize: '0.75rem' }}>{r.tripId}</span> : '—' },
  ];

  const summaryColumns = [
    { key: 'name', label: 'Vehicle', render: (r) => <><span style={{ fontWeight: 600 }}>{r.name}</span><br /><span className="text-sm text-muted">{r.model}</span></> },
    { key: 'type', label: 'Type' },
    { key: 'tripCount', label: 'Trips', render: (r) => <span className="mono">{r.tripCount}</span> },
    { key: 'fuelCost', label: 'Fuel Cost', render: (r) => <span className="mono">{formatCurrency(r.fuelCost)}</span> },
    { key: 'maintCost', label: 'Maint. Cost', render: (r) => <span className="mono">{formatCurrency(r.maintCost)}</span> },
    { key: 'totalCost', label: 'Total Ops', render: (r) => <span className="mono" style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatCurrency(r.totalCost)}</span> },
  ];

  const totalExpenses = expenses.reduce((s, e) => s + e.cost, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1><DollarSign size={24} /> Expenses & Fuel</h1>
        <div className="page-header-actions">
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
            <button className="btn btn-sm" style={{ borderRadius: 0, border: 'none', background: viewMode === 'all' ? 'var(--brand-primary)' : 'var(--bg-card)', color: viewMode === 'all' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setViewMode('all')}>All Expenses</button>
            <button className="btn btn-sm" style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border-color)', background: viewMode === 'summary' ? 'var(--brand-primary)' : 'var(--bg-card)', color: viewMode === 'summary' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setViewMode('summary')}>Per Vehicle</button>
          </div>
          {perms.canAddExpense && <button className="btn btn-primary" onClick={() => { setDrawer(true); setError(''); }}><Plus size={15} /> Add Expense</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard icon={DollarSign} label="Total Expenses" value={formatCurrency(totalExpenses)} sub="Fuel + Toll + Other" />
        <StatCard icon={Wrench} label="Total Maintenance" value={formatCurrency(totalMaint)} sub="Service costs" />
        <StatCard icon={Calculator} label="Combined Ops" value={formatCurrency(totalExpenses + totalMaint)} sub="Total operational cost" />
      </div>

      {viewMode === 'all' ? (
        <DataTable columns={columns} data={[...expenses].reverse()} emptyMessage="No expenses recorded" />
      ) : (
        <DataTable columns={summaryColumns} data={vehicleSummaries} emptyMessage="No expense data" />
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Add Expense">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle *</label>
              <select className="form-select" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Fuel</option><option>Toll</option><option>Parking</option><option>Other</option>
              </select>
            </div>
          </div>
          {form.type === 'Fuel' && (
            <div className="form-group">
              <label>Liters</label>
              <input className="form-input" type="number" placeholder="0" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} />
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Cost *</label>
              <input className="form-input" type="number" placeholder="0" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Trip (Optional)</label>
            <select className="form-select" value={form.tripId} onChange={e => setForm({ ...form, tripId: e.target.value })}>
              <option value="">No trip linked</option>
              {trips.filter(t => t.vehicleId === form.vehicleId).map(t => <option key={t.id} value={t.id}>{t.id} — {t.origin} → {t.destination}</option>)}
            </select>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Expense</button>
          </div>
        </form>
      </Drawer>
    </motion.div>
  );
}
