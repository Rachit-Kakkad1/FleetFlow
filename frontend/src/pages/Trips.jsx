import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { tripService } from '../api/services';
import { validateCargoWeight, validateDriverLicense, validateDriverVehicleCategory } from '../utils/validators';
import { getPermissions, isReadOnly } from '../config/roleConfig';
import DataTable from '../components/ui/DataTable';
import StatusChip from '../components/ui/StatusChip';
import Drawer from '../components/ui/Drawer';
import { motion } from 'framer-motion';
import { Navigation, Plus } from 'lucide-react';

export default function Trips() {
  const { vehicles, drivers, trips, refresh, showToast, user } = useFleet();
  const perms = getPermissions(user?.role);
  const readOnly = isReadOnly(user?.role, '/trips');
  const [drawer, setDrawer] = useState(null);
  const [completeTrip, setCompleteTrip] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [form, setForm] = useState({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', description: '' });
  const [error, setError] = useState('');

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'On Duty' && new Date(d.licenseExpiry) > new Date());
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]));
  const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination || !form.cargoWeight) {
      setError('Please fill in all required fields'); return;
    }
    const vehicle = vehicles.find(v => v.id === form.vehicleId);
    const driver = drivers.find(d => d.id === form.driverId);
    const weightCheck = validateCargoWeight(Number(form.cargoWeight), vehicle.maxCapacity);
    if (!weightCheck.valid) { setError(weightCheck.error); return; }
    const licenseCheck = validateDriverLicense(driver);
    if (!licenseCheck.valid) { setError(licenseCheck.error); return; }
    const categoryCheck = validateDriverVehicleCategory(driver, vehicle);
    if (!categoryCheck.valid) { setError(categoryCheck.error); return; }

    tripService.create({ ...form, cargoWeight: Number(form.cargoWeight) });
    refresh();
    showToast('Trip created as Draft');
    setDrawer(null);
    setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', description: '' });
  };

  const handleDispatch = (trip) => {
    tripService.dispatch(trip.id); refresh();
    showToast(`Trip ${trip.id} dispatched!`);
  };

  const handleComplete = () => {
    if (!endOdometer) { showToast('Enter final odometer reading', 'error'); return; }
    tripService.complete(completeTrip.id, Number(endOdometer));
    refresh();
    showToast(`Trip ${completeTrip.id} completed!`);
    setCompleteTrip(null); setEndOdometer('');
  };

  const handleCancel = (trip) => {
    tripService.cancel(trip.id); refresh();
    showToast(`Trip ${trip.id} cancelled`);
  };

  const displayTrips = readOnly ? trips.filter(t => t.status === 'Completed') : trips;

  const columns = [
    { key: 'id', label: 'Trip ID', render: (r) => <span className="mono" style={{ color: 'var(--brand-primary)', fontSize: '0.8rem' }}>{r.id}</span> },
    { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleMap[r.vehicleId]?.name || r.vehicleId },
    { key: 'driverId', label: 'Driver', render: (r) => driverMap[r.driverId]?.name || r.driverId },
    { key: 'route', label: 'Route', render: (r) => `${r.origin} → ${r.destination}`, sortable: false },
    { key: 'cargoWeight', label: 'Cargo', render: (r) => <span className="mono">{r.cargoWeight.toLocaleString()} kg</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    ...(!readOnly ? [{
      key: 'actions', label: '', sortable: false, render: (r) => (
        <div style={{ display: 'flex', gap: 4, opacity: 0.7 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        >
          {r.status === 'Draft' && perms.canDispatchTrip && <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); handleDispatch(r); }}>Dispatch</button>}
          {r.status === 'Dispatched' && perms.canCompleteTrip && <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); setCompleteTrip(r); setEndOdometer(''); }}>Complete</button>}
          {(r.status === 'Draft' || r.status === 'Dispatched') && perms.canCancelTrip && <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleCancel(r); }}>Cancel</button>}
        </div>
      )
    }] : []),
  ];

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1>
          <Navigation size={24} />
          {readOnly ? 'Completed Trips' : 'Trip Dispatcher'}
          {readOnly && <span style={{ fontSize: '0.7rem', fontWeight: 600, marginLeft: 10, padding: '3px 8px', borderRadius: 12, background: 'var(--status-info-bg)', color: 'var(--status-info)' }}>View Only</span>}
        </h1>
        {perms.canCreateTrip && (
          <button className="btn btn-primary" onClick={() => { setDrawer('create'); setError(''); }}>
            <Plus size={15} /> Create Trip
          </button>
        )}
      </div>

      <DataTable columns={columns} data={[...displayTrips].reverse()} emptyMessage="No trips found" />

      {/* Create Trip Drawer */}
      <Drawer open={drawer === 'create'} onClose={() => setDrawer(null)} title="Create New Trip">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle *</label>
              <select className="form-select" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle...</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.type} · {v.maxCapacity}kg)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Driver *</label>
              <select className="form-select" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Select driver...</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.category})</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Origin *</label>
              <input className="form-input" placeholder="e.g. Ahmedabad" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Destination *</label>
              <input className="form-input" placeholder="e.g. Surat" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cargo Weight (kg) *</label>
              <input className="form-input" type="number" placeholder="0" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} />
              {selectedVehicle && form.cargoWeight && (
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: Number(form.cargoWeight) <= selectedVehicle.maxCapacity ? 'var(--status-success)' : 'var(--status-error)' }}>
                  {Number(form.cargoWeight) <= selectedVehicle.maxCapacity
                    ? `${form.cargoWeight}/${selectedVehicle.maxCapacity}kg`
                    : `Exceeds ${selectedVehicle.maxCapacity}kg capacity`}
                </span>
              )}
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="form-input" placeholder="Cargo description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Trip</button>
          </div>
        </form>
      </Drawer>

      {/* Complete Trip Drawer */}
      <Drawer open={!!completeTrip} onClose={() => setCompleteTrip(null)} title={`Complete Trip ${completeTrip?.id}`}>
        {completeTrip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {completeTrip.origin} → {completeTrip.destination} · {vehicleMap[completeTrip.vehicleId]?.name}
            </p>
            <div className="form-group">
              <label>Final Odometer Reading (km) *</label>
              <input className="form-input" type="number" placeholder="e.g. 45000" value={endOdometer} onChange={e => setEndOdometer(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setCompleteTrip(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleComplete}>Mark Complete</button>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
}
