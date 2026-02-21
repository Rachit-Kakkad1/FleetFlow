import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useFleet } from '../context/FleetContext';

// Assuming backend runs on the same host or environment variable
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useRealTime() {
    const { showToast, refresh, user } = useFleet();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return; // Only connect if logged in

        const newSocket = io(SOCKET_URL, {
            // Optional: pass token if auth is needed for sockets
            auth: { token: localStorage.getItem('ff_token') }
        });

        newSocket.on('connect', () => {
            console.log('🔗 Connected to Real-Time Server');
        });

        newSocket.on('sos_alert', (data) => {
            if (user.role === 'Manager' || user.role === 'Safety Officer' || user.role === 'Dispatcher') {
                showToast(`🚨 SOS DETECTED! Vehicle: ${data.vehicleId.slice(0, 8)}`, 'error');
            }
        });

        newSocket.on('fuel_anomaly', (data) => {
            if (user.role === 'Manager' || user.role === 'Safety Officer') {
                showToast(`⚠️ Fuel Anomaly Detected! Vehicle: ${data.vehicleId.slice(0, 8)}`, 'warning');
                refresh();
            }
        });

        newSocket.on('trip_status_change', (data) => {
            // Re-fetch trips quietly when status changes
            refresh();
            if (user.role === 'Dispatcher') {
                showToast(`Trip ${data.tripId.slice(0, 8)} status updated to ${data.status}`, 'success');
            }
            if (user.role === 'Driver' && data.status === 'APPROVED') {
                showToast(`✅ A new trip has cleared Safety Inspection and is ready!`, 'success');
            }
        });

        newSocket.on('delivery_verification', (data) => {
            if (user.role === 'Manager' || user.role === 'Dispatcher') {
                showToast(`📦 Delivery Proof Uploaded for Trip: ${data.tripId.slice(0, 8)}`, 'success');
                refresh();
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, showToast, refresh]);

    return socket;
}
