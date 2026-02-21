import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { vehicleService } from '../api/services';
import { getPermissions } from '../config/roleConfig';
import DataTable from '../components/ui/DataTable';
import StatusChip from '../components/ui/StatusChip';
import Drawer from '../components/ui/Drawer';
import { motion } from 'framer-motion';
import { Truck, Plus, LayoutGrid, LayoutList } from 'lucide-react';

const emptyVehicle = { name: '', model: '', type: 'Truck', licensePlate: '', maxCapacity: '', odometer: '', region: 'West', acquisitionCost: '' };

export default function Vehicles() {
  const { vehicles, refresh, showToast, user } = useFleet();
  const perms = getPermissions(user?.role);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState(emptyVehicle);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const openAdd = () => { setForm(emptyVehicle); setEditId(null); setError(''); setDrawer('form'); };
  const openEdit = (v) => { setForm(v); setEditId(v.id); setError(''); setDrawer('form'); };
  const openDetail = (v) => { setForm(v); setDrawer('detail'); };
  const close = () => setDrawer(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.licensePlate || !form.maxCapacity) {
      setError('Please fill in required fields'); return;
    }
    const existing = vehicles.find(v => v.licensePlate === form.licensePlate && v.id !== editId);
    if (existing) { setError('License plate already exists'); return; }

    if (editId) {
      vehicleService.update(editId, { ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) });
      showToast('Vehicle updated successfully');
    } else {
      vehicleService.create({ ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer || 0), acquisitionCost: Number(form.acquisitionCost || 0) });
      showToast('Vehicle added successfully');
    }
    refresh(); close();
  };

  const handleRetire = (v) => {
    vehicleService.updateStatus(v.id, v.status === 'Retired' ? 'Available' : 'Retired');
    refresh();
    showToast(v.status === 'Retired' ? 'Vehicle reactivated' : 'Vehicle retired');
  };

  const handleDelete = (v) => {
    if (v.status === 'On Trip') { showToast('Cannot delete a vehicle on trip', 'error'); return; }
    vehicleService.delete(v.id);
    refresh();
    showToast('Vehicle deleted');
  };

  const columns = [
    { key: 'name', label: 'Vehicle', render: (r) => <><span style={{ fontWeight: 600 }}>{r.name}</span><br /><span className="text-sm text-muted">{r.model}</span></> },
    { key: 'type', label: 'Type' },
    { key: 'licensePlate', label: 'License Plate', render: (r) => <span className="mono" style={{ fontSize: '0.8rem' }}>{r.licensePlate}</span> },
    { key: 'maxCapacity', label: 'Capacity', render: (r) => <span className="mono">{r.maxCapacity.toLocaleString()} kg</span> },
    { key: 'odometer', label: 'Odometer', render: (r) => <span className="mono">{r.odometer.toLocaleString()} km</span> },
    { key: 'region', label: 'Region' },
    { key: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    ...(perms.canEditVehicle || perms.canRetireVehicle ? [{
      key: 'actions', label: '', sortable: false, render: (r) => (
        <div style={{ display: 'flex', gap: 4, opacity: 0.7 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        >
          {perms.canEditVehicle && <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</button>}
          {perms.canRetireVehicle && (
            <button className={`btn btn-sm ${r.status === 'Retired' ? 'btn-success' : 'btn-danger'}`}
              onClick={e => { e.stopPropagation(); handleRetire(r); }}>
              {r.status === 'Retired' ? 'Activate' : 'Retire'}
            </button>
          )}
        </div>
      )
    }] : []),
  ];

  const FormContent = () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Vehicle Name *</label>
          <input className="form-input" placeholder="e.g. Cargo Master" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input className="form-input" placeholder="e.g. Tata 407" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option>Truck</option><option>Van</option><option>Bike</option>
          </select>
        </div>
        <div className="form-group">
          <label>License Plate *</label>
          <input className="form-input" placeholder="GJ-01-XX-0000" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Max Capacity (kg) *</label>
          <input className="form-input" type="number" placeholder="500" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Odometer (km)</label>
          <input className="form-input" type="number" placeholder="0" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Region</label>
          <select className="form-select" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
            <option>West</option><option>North</option><option>South</option><option>East</option>
          </select>
        </div>
        <div className="form-group">
          <label>Acquisition Cost</label>
          <input className="form-input" type="number" placeholder="0" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
        <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Vehicle'}</button>
      </div>
    </form>
  );

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1><Truck size={24} /> Vehicle Registry
          {!perms.canEditVehicle && <span style={{ fontSize: '0.7rem', fontWeight: 600, marginLeft: 10, padding: '3px 8px', borderRadius: 12, background: 'var(--status-info-bg)', color: 'var(--status-info)' }}>View Only</span>}
        </h1>
        <div className="page-header-actions">
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
            <button className={`btn-icon ${viewMode === 'table' ? '' : ''}`}
              style={{ borderRadius: 0, border: 'none', background: viewMode === 'table' ? 'var(--status-success-bg)' : 'transparent', color: viewMode === 'table' ? 'var(--brand-primary)' : 'var(--text-muted)' }}
              onClick={() => setViewMode('table')}><LayoutList size={16} /></button>
            <button className={`btn-icon`}
              style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border-color)', background: viewMode === 'grid' ? 'var(--status-success-bg)' : 'transparent', color: viewMode === 'grid' ? 'var(--brand-primary)' : 'var(--text-muted)' }}
              onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></button>
          </div>
          {perms.canCreateVehicle && (
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Vehicle</button>
          )}
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={vehicles} onRowClick={openDetail} emptyMessage="No vehicles registered" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              className="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => openDetail(v)}
              style={{ cursor: 'pointer', padding: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.model}</p>
                </div>
                <StatusChip status={v.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Type</span><br />{v.type}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Plate</span><br /><span className="mono">{v.licensePlate}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Capacity</span><br /><span className="mono">{v.maxCapacity.toLocaleString()} kg</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Odometer</span><br /><span className="mono">{v.odometer.toLocaleString()} km</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      <Drawer open={drawer === 'form'} onClose={close} title={editId ? 'Edit Vehicle' : 'Add New Vehicle'}>
        <FormContent />
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        open={drawer === 'detail'}
        onClose={close}
        title={form.name || 'Vehicle Details'}
        footer={perms.canEditVehicle ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setDrawer('form'); setEditId(form.id); setError(''); }}>Edit</button>
            {perms.canRetireVehicle && (
              <button className={`btn ${form.status === 'Retired' ? 'btn-success' : 'btn-danger'}`} onClick={() => { handleRetire(form); close(); }}>
                {form.status === 'Retired' ? 'Activate' : 'Retire'}
              </button>
            )}
          </div>
        ) : null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{form.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.model}</p>
            </div>
            <StatusChip status={form.status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '0.8125rem' }}>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 2 }}>Type</p><p style={{ fontWeight: 600 }}>{form.type}</p></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 2 }}>License Plate</p><p className="mono" style={{ fontWeight: 600 }}>{form.licensePlate}</p></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 2 }}>Max Capacity</p><p className="mono" style={{ fontWeight: 600 }}>{form.maxCapacity?.toLocaleString?.()} kg</p></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 2 }}>Odometer</p><p className="mono" style={{ fontWeight: 600 }}>{form.odometer?.toLocaleString?.()} km</p></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 2 }}>Region</p><p style={{ fontWeight: 600 }}>{form.region}</p></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 2 }}>Acquisition Cost</p><p className="mono" style={{ fontWeight: 600 }}>₹{form.acquisitionCost?.toLocaleString?.()}</p></div>
          </div>
        </div>
      </Drawer>
    </motion.div>
  );
}
