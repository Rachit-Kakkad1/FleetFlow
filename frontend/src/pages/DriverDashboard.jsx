import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFleet } from '../context/FleetContext';
import { tripService, expenseService } from '../api/services';
import Drawer from '../components/ui/Drawer';
import { Navigation, Camera, Edit3, DollarSign, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function DriverDashboard() {
    const { user, showToast } = useFleet();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerType, setDrawerType] = useState(null); // 'delivery' | 'expense' | 'sos'
    const [selectedTrip, setSelectedTrip] = useState(null);

    // Delivery Form
    const [deliveryForm, setDeliveryForm] = useState({ photoUrl: '', notes: '', signatureUrl: '' });

    // Expense Form
    const [expenseForm, setExpenseForm] = useState({ type: 'FUEL', cost: '', liters: '', notes: '' });

    // Signature Canvas Ref
    const canvasRef = useRef(null);
    let isDrawing = false;

    useEffect(() => {
        fetchMyTrips();
    }, []);

    const fetchMyTrips = async () => {
        setLoading(true);
        const myTrips = await tripService.getMyTrips();
        setTrips(myTrips);
        setLoading(false);
    };

    const handleAccept = async (tripId) => {
        try {
            await tripService.acceptTrip(tripId);
            showToast('Trip accepted and started!', 'success');
            fetchMyTrips();
        } catch (error) {
            showToast('Failed to accept trip', 'error');
        }
    };

    const handleReject = async (tripId) => {
        try {
            await tripService.cancel(tripId); // Cancels/Rejects the trip, releasing the driver
            showToast('Trip rejected successfully.', 'warning');
            fetchMyTrips();
        } catch (error) {
            showToast('Failed to reject trip', 'error');
        }
    };

    const openDrawer = (trip, type) => {
        setSelectedTrip(trip);
        setDrawerType(type);
        setDrawerOpen(true);
        if (type === 'delivery') {
            setDeliveryForm({ photoUrl: '', notes: '', signatureUrl: '' });
        } else if (type === 'expense') {
            setExpenseForm({ type: 'FUEL', cost: '', liters: '', notes: '' });
        }
    };

    const handleDeliverySubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post(`/trips/${selectedTrip.id}/proof`, {
                photoUrl: deliveryForm.photoUrl,
                notes: deliveryForm.notes
            });
            if (deliveryForm.signatureUrl) {
                await apiClient.post(`/trips/${selectedTrip.id}/signature`, {
                    signatureUrl: deliveryForm.signatureUrl
                });
            }
            await tripService.complete(selectedTrip.id, selectedTrip.startOdometer + 100); // Dummy distance
            showToast('Delivery proof submitted successfully!', 'success');
            setDrawerOpen(false);
            fetchMyTrips();
        } catch (error) {
            showToast('Failed to submit delivery', 'error');
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await expenseService.create({
                vehicleId: selectedTrip.vehicleId,
                tripId: selectedTrip.id,
                ...expenseForm
            });
            showToast('Expense logged successfully!', 'success');
            setDrawerOpen(false);
        } catch (error) {
            showToast('Failed to log expense', 'error');
        }
    };

    const triggerSOS = async () => {
        if (!selectedTrip) {
            showToast('No active trip selected for SOS.', 'error');
            return;
        }
        try {
            await apiClient.post('/drivers/sos', {
                driverId: selectedTrip.driverId,
                vehicleId: selectedTrip.vehicleId,
                gpsLat: 0, gpsLng: 0 // Mock location
            });
            showToast('SOS Alert Sent!', 'error');
        } catch (error) {
            showToast('Failed to send SOS', 'warning');
        }
    };

    const startDrawing = (e) => {
        isDrawing = true;
        draw(e);
    };

    const endDrawing = () => {
        isDrawing = false;
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL();
            setDeliveryForm({ ...deliveryForm, signatureUrl: dataUrl });
        }
    };

    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                <h1>Welcome, {user?.name}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Driver Portal</p>
                <button className="btn btn-danger" onClick={triggerSOS} style={{ width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <AlertTriangle size={24} /> SOS EMERGENCY
                </button>
            </div>

            <h3 style={{ marginTop: 20 }}>My Active & Assigned Trips</h3>
            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
                    {trips.map(trip => (
                        <div key={trip.id} style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <strong>{trip.code}</strong>
                                <span className={`status-chip ${trip.status === 'APPROVED' ? 'available' : 'on-trip'}`}>{trip.status}</span>
                            </div>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}><Navigation size={14} /> {trip.origin} → {trip.destination}</p>

                            <div style={{ marginTop: 12, marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <p><strong>Vehicle:</strong> {trip.vehicle?.name} ({trip.vehicle?.licensePlate})</p>
                                <p><strong>Cargo:</strong> {trip.cargoDescription} ({trip.cargoWeight} kg)</p>
                            </div>

                            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {trip.status === 'APPROVED' && (
                                    <>
                                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAccept(trip.id)}>
                                            <CheckCircle2 size={16} /> Accept Trip
                                        </button>
                                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleReject(trip.id)}>
                                            <XCircle size={16} /> Reject Trip
                                        </button>
                                    </>
                                )}
                                {trip.status === 'ON_TRIP' && (
                                    <>
                                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => openDrawer(trip, 'delivery')}>
                                            <Camera size={16} /> Finish & Proof
                                        </button>
                                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => openDrawer(trip, 'expense')}>
                                            <DollarSign size={16} /> Log Fuel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {trips.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No trips currently assigned or active.</p>}
                </div>
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerType === 'delivery' ? 'Submit Delivery Proof' : 'Log Expense'}>
                {drawerType === 'delivery' && (
                    <form onSubmit={handleDeliverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label>Delivery Photo URL *</label>
                            <input className="form-input" required value={deliveryForm.photoUrl} onChange={e => setDeliveryForm({ ...deliveryForm, photoUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea className="form-input" value={deliveryForm.notes} onChange={e => setDeliveryForm({ ...deliveryForm, notes: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>E-Signature</label>
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                                <canvas
                                    ref={canvasRef}
                                    width={300} height={150}
                                    onMouseDown={startDrawing} onMouseUp={endDrawing} onMouseMove={draw}
                                    onTouchStart={startDrawing} onTouchEnd={endDrawing} onTouchMove={draw}
                                    style={{ width: '100%', touchAction: 'none' }}
                                />
                            </div>
                            <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={() => {
                                const ctx = canvasRef.current.getContext('2d');
                                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                setDeliveryForm({ ...deliveryForm, signatureUrl: '' });
                            }}>Clear Signature</button>
                        </div>
                        <button type="submit" className="btn btn-primary">Complete Delivery</button>
                    </form>
                )}

                {drawerType === 'expense' && (
                    <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label>Expense Type</label>
                            <select className="form-select" value={expenseForm.type} onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                                <option value="FUEL">Fuel</option>
                                <option value="TOLL">Toll</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Total Cost</label>
                            <input className="form-input" type="number" required value={expenseForm.cost} onChange={e => setExpenseForm({ ...expenseForm, cost: e.target.value })} />
                        </div>
                        {expenseForm.type === 'FUEL' && (
                            <div className="form-group">
                                <label>Liters</label>
                                <input className="form-input" type="number" required value={expenseForm.liters} onChange={e => setExpenseForm({ ...expenseForm, liters: e.target.value })} />
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary">Save Expense</button>
                    </form>
                )}
            </Drawer>
        </motion.div>
    );
}
