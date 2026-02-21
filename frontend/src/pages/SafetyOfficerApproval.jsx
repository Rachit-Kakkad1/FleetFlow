import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFleet } from '../context/FleetContext';
import { tripService } from '../api/services';
import Drawer from '../components/ui/Drawer';
import { ClipboardCheck, CheckCircle2, XCircle, Search, Calendar, FileText, Camera } from 'lucide-react';

export default function SafetyOfficerApproval() {
    const { showToast } = useFleet();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve' | 'decline'
    const [actionForm, setActionForm] = useState({ photoUrl: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        const data = await tripService.getPending();
        setTrips(data);
        setLoading(false);
    };

    const handleActionClick = (trip, type) => {
        setSelectedTrip(trip);
        setActionType(type);
        setActionForm({ photoUrl: '', reason: '' });
        setDrawerOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!actionForm.photoUrl) {
            showToast('Package inspection photo URL is strictly required before proceeding.', 'error');
            return;
        }
        if (actionType === 'decline' && !actionForm.reason) {
            showToast('Reason is required for declination.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            if (actionType === 'approve') {
                await tripService.approve(selectedTrip.id, actionForm.photoUrl);
                showToast(`Trip ${selectedTrip.code} Appproved`, 'success');
            } else {
                await tripService.decline(selectedTrip.id, actionForm.reason, actionForm.photoUrl);
                showToast(`Trip ${selectedTrip.code} Declined`, 'error');
            }
            setDrawerOpen(false);
            fetchTrips();
        } catch (error) {
            showToast('Failed to process request', 'error');
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading pending trips...</div>;
    }

    return (
        <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1><ClipboardCheck size={24} /> Safety Approval Queue</h1>
                <div style={{ color: 'var(--text-secondary)' }}>Trips pending dispatch safety inspection</div>
            </div>

            <div className="data-table-wrapper" style={{ marginTop: 24 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Trip Code</th>
                            <th>Driver</th>
                            <th>Vehicle</th>
                            <th>Cargo Weight</th>
                            <th>License Validity</th>
                            <th>Compliance Info</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No pending safety approvals</td></tr>
                        ) : trips.map(trip => (
                            <tr key={trip.id}>
                                <td data-label="Trip Code" style={{ fontWeight: 600 }}>{trip.code}</td>
                                <td data-label="Driver">{trip.driver?.name}</td>
                                <td data-label="Vehicle">{trip.vehicle?.name}</td>
                                <td data-label="Cargo Weight">{trip.cargoWeight} kg</td>
                                <td data-label="License Validity">
                                    {trip.driver?.licenseExpiry ? (
                                        new Date(trip.driver.licenseExpiry) > new Date()
                                            ? <span className="status-tag success">Valid ({new Date(trip.driver.licenseExpiry).toLocaleDateString()})</span>
                                            : <span className="status-tag error">Expired</span>
                                    ) : <span className="status-tag warning">Unknown</span>}
                                </td>
                                <td data-label="Compliance Info">
                                    <div style={{ fontSize: '0.85rem' }}>
                                        Driver Score: <b>{trip.driver?.safetyScore || 'N/A'}</b><br />
                                        Veh. Cap: <b>{trip.vehicle?.maxCapacityKg ? `${trip.vehicle.maxCapacityKg} kg` : 'N/A'}</b>
                                    </div>
                                </td>
                                <td data-label="Actions">
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-sm btn-primary" onClick={() => handleActionClick(trip, 'approve')} style={{ background: 'var(--status-success)', color: '#fff', border: 'none' }}>
                                            <CheckCircle2 size={14} /> Approve
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleActionClick(trip, 'decline')}>
                                            <XCircle size={14} /> Decline
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Safety Decision - ${selectedTrip?.code}`}>
                {selectedTrip && (
                    <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-active)', borderRadius: 8 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Trip Details</div>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><b>Driver:</b> {selectedTrip.driver?.name}</p>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><b>Vehicle:</b> {selectedTrip.vehicle?.name}</p>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><b>Cargo Weight:</b> {selectedTrip.cargoWeight} kg</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label><Camera size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Package Inspection Photo URL <span style={{ color: 'var(--status-error)' }}>*</span></label>
                        <input
                            className="form-input"
                            placeholder="https://..."
                            value={actionForm.photoUrl}
                            onChange={e => setActionForm({ ...actionForm, photoUrl: e.target.value })}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>MANDATORY: Upload the inspection photo of the package before Approval OR Decline.</small>
                    </div>

                    {actionType === 'decline' && (
                        <div className="form-group">
                            <label>Decline Reason <span style={{ color: 'var(--status-error)' }}>*</span></label>
                            <textarea
                                className="form-input"
                                placeholder="Why is this trip unsafe for dispatch?"
                                value={actionForm.reason}
                                onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                                style={{ minHeight: 80, resize: 'vertical' }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setDrawerOpen(false)}>Cancel</button>
                        <button type="submit" className={`btn ${actionType === 'approve' ? 'btn-primary' : 'btn-danger'}`} disabled={submitting}>
                            {submitting ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Decline'}`}
                        </button>
                    </div>
                </form>
            </Drawer>
        </motion.div>
    );
}
