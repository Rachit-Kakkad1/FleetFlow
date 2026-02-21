import apiClient from './client';

// ===== VEHICLES =====
const mapVehicleParams = (veh) => {
    const data = { ...veh };
    if ('maxCapacity' in data) { data.maxCapacityKg = Number(data.maxCapacity); delete data.maxCapacity; }
    if ('odometer' in data) { data.odometerKm = Number(data.odometer); delete data.odometer; }
    if ('acquisitionCost' in data) { data.acquisitionCost = Number(data.acquisitionCost); }
    return data;
};

const mapVehicleResp = (veh) => ({
    ...veh,
    maxCapacity: veh.maxCapacityKg,
    odometer: veh.odometerKm,
    status: veh.status ? veh.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : veh.status
});

export const vehicleService = {
    getAll: async () => { try { const { data } = await apiClient.get('/vehicles'); return data.data.map(mapVehicleResp); } catch (e) { return []; } },
    getById: async (id) => { const { data } = await apiClient.get(`/vehicles/${id}`); return mapVehicleResp(data.data); },
    getAvailable: async () => { try { const { data } = await apiClient.get('/vehicles/available'); return data.data.map(mapVehicleResp); } catch (e) { return []; } },
    create: async (vehicle) => { const { data } = await apiClient.post('/vehicles', mapVehicleParams(vehicle)); return mapVehicleResp(data.data); },
    update: async (id, updates) => { const { data } = await apiClient.put(`/vehicles/${id}`, mapVehicleParams(updates)); return mapVehicleResp(data.data); },
    updateStatus: async (id, status) => { const { data } = await apiClient.patch(`/vehicles/${id}/status`, { status: status.toUpperCase().replace(' ', '_') }); return mapVehicleResp(data.data); },
    retire: async (id) => { const { data } = await apiClient.patch(`/vehicles/${id}/retire`); return mapVehicleResp(data.data); },
    delete: async (id) => { await apiClient.delete(`/vehicles/${id}`); },
};

// ===== DRIVERS =====
const mapDriverParams = (drv) => {
    const data = { ...drv };
    if ('licenseNo' in data) { data.licenseNumber = data.licenseNo; delete data.licenseNo; }
    if ('category' in data) { data.licenseCategories = [data.category]; delete data.category; }
    if ('tripsAssigned' in data) { data.totalTrips = data.tripsAssigned; delete data.tripsAssigned; }
    if ('tripsCompleted' in data) { data.completedTrips = data.tripsCompleted; delete data.tripsCompleted; }
    if ('licenseExpiry' in data) { data.licenseExpiry = new Date(data.licenseExpiry).toISOString(); }
    return data;
};

const mapDriverResp = (drv) => ({
    ...drv,
    licenseNo: drv.licenseNumber,
    category: drv.licenseCategories?.[0] || 'LMV',
    tripsAssigned: drv.totalTrips,
    tripsCompleted: drv.completedTrips
});

export const driverService = {
    getAll: async () => { try { const { data } = await apiClient.get('/drivers'); return data.data.map(mapDriverResp); } catch (e) { return []; } },
    getById: async (id) => { const { data } = await apiClient.get(`/drivers/${id}`); return mapDriverResp(data.data); },
    getAvailable: async () => { try { const { data } = await apiClient.get('/drivers/available'); return data.data.map(mapDriverResp); } catch (e) { return []; } },
    create: async (driver) => { const { data } = await apiClient.post('/drivers', mapDriverParams(driver)); return mapDriverResp(data.data); },
    update: async (id, updates) => { const { data } = await apiClient.put(`/drivers/${id}`, mapDriverParams(updates)); return mapDriverResp(data.data); },
    updateStatus: async (id, status) => { const { data } = await apiClient.patch(`/drivers/${id}/status`, { status: status.toUpperCase().replace(' ', '_') }); return mapDriverResp(data.data); },
    delete: async (id) => { await apiClient.delete(`/drivers/${id}`); },
    isLicenseExpired: (driver) => new Date(driver.licenseExpiry) < new Date(),
    isLicenseExpiringSoon: (driver) => {
        const expiry = new Date(driver.licenseExpiry);
        const days = (expiry - new Date()) / (1000 * 60 * 60 * 24);
        return days > 0 && days <= 30;
    },
};

// ===== TRIPS =====
const mapTripParams = (trp) => {
    const data = { ...trp };
    if ('cargoWeight' in data) { data.cargoWeightKg = Number(data.cargoWeight); delete data.cargoWeight; }
    if ('description' in data) { data.cargoDescription = data.description || 'General Cargo'; delete data.description; }
    if ('startOdometer' in data) { data.startOdometerKm = Number(data.startOdometer); delete data.startOdometer; }
    if ('endOdometer' in data) { data.endOdometerKm = Number(data.endOdometer); delete data.endOdometer; }
    return data;
};

const mapTripResp = (trp) => ({
    ...trp,
    cargoWeight: trp.cargoWeightKg,
    description: trp.cargoDescription,
    startOdometer: trp.startOdometerKm,
    endOdometer: trp.endOdometerKm,
    status: trp.status ? trp.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : trp.status
});

export const tripService = {
    getAll: async () => { try { const { data } = await apiClient.get('/trips'); return data.data.map(mapTripResp); } catch (e) { return []; } },
    getById: async (id) => { const { data } = await apiClient.get(`/trips/${id}`); return mapTripResp(data.data); },
    getPending: async () => { try { const { data } = await apiClient.get('/trips/pending'); return data.data.map(mapTripResp); } catch (e) { return []; } },
    getMyTrips: async () => { try { const { data } = await apiClient.get('/trips/me'); return data.data.map(mapTripResp); } catch (e) { return []; } },
    create: async (trip) => { const { data } = await apiClient.post('/trips', mapTripParams(trip)); return mapTripResp(data.data); },
    approve: async (id, photoUrl) => { const { data } = await apiClient.patch(`/trips/${id}/approve`, { photoUrl }); return mapTripResp(data.data); },
    decline: async (id, reason, photoUrl) => { const { data } = await apiClient.patch(`/trips/${id}/decline`, { reason, photoUrl }); return mapTripResp(data.data); },
    acceptTrip: async (id) => { const { data } = await apiClient.patch(`/trips/${id}/accept`); return mapTripResp(data.data); },
    complete: async (id, endOdometer) => { const { data } = await apiClient.patch(`/trips/${id}/complete`, { endOdometerKm: Number(endOdometer) }); return mapTripResp(data.data); },
    cancel: async (id) => { const { data } = await apiClient.patch(`/trips/${id}/cancel`); return mapTripResp(data.data); },
    verifyDelivery: async (id) => { const { data } = await apiClient.patch(`/trips/${id}/verify-delivery`); return data.data; },
    rejectDelivery: async (id, reason) => { const { data } = await apiClient.patch(`/trips/${id}/reject-delivery`, { reason }); return data.data; },
};

// ===== MAINTENANCE =====
const mapMaintenanceParams = (maint) => {
    const data = { ...maint };
    if ('serviceType' in data) { data.description = data.serviceType; delete data.serviceType; }
    if ('date' in data) { data.startDate = new Date(data.date).toISOString(); delete data.date; }
    if ('cost' in data) { data.cost = Number(data.cost); }
    if (!data.type) { data.type = 'REACTIVE'; }
    else { data.type = data.type.toUpperCase(); }
    return data;
};

const mapMaintenanceResp = (maint) => ({
    ...maint,
    serviceType: maint.description,
    date: maint.startDate,
});

export const maintenanceService = {
    getAll: async () => { try { const { data } = await apiClient.get('/maintenance'); return data.data.map(mapMaintenanceResp); } catch (e) { return []; } },
    getByVehicle: async (vehicleId) => { try { const { data } = await apiClient.get(`/maintenance/vehicle/${vehicleId}`); return data.data.map(mapMaintenanceResp); } catch (e) { return []; } },
    create: async (log) => { const { data } = await apiClient.post('/maintenance', mapMaintenanceParams(log)); return mapMaintenanceResp(data.data); },
    complete: async (id) => { const { data } = await apiClient.patch(`/maintenance/${id}/complete`); return mapMaintenanceResp(data.data); },
};

// ===== EXPENSES =====
const mapExpenseParams = (exp) => {
    const data = { ...exp };
    if ('type' in data) { data.category = data.type.toUpperCase(); delete data.type; }
    if ('cost' in data) { data.cost = Number(data.cost); }
    if ('liters' in data) { data.liters = Number(data.liters); }
    if ('date' in data) { data.date = new Date(data.date).toISOString(); }
    return data;
};

const mapExpenseResp = (exp) => ({ ...exp, type: exp.category });

export const expenseService = {
    getAll: async () => { try { const { data } = await apiClient.get('/expenses'); return data.data.map(mapExpenseResp); } catch (e) { return []; } },
    create: async (expense) => { const { data } = await apiClient.post('/expenses', mapExpenseParams(expense)); return mapExpenseResp(data.data); },
    getByVehicle: async (vehicleId) => {
        const { data } = await apiClient.get('/expenses');
        return data.data.map(mapExpenseResp).filter(e => e.vehicleId === vehicleId);
    },
    getTotalCostByVehicle: async (vehicleId) => {
        try {
            const { data } = await apiClient.get(`/expenses/vehicle/${vehicleId}/total`);
            return data.data;
        } catch (e) {
            return { fuelCost: 0, maintCost: 0, total: 0 };
        }
    },
    getAnomalies: async () => { try { const { data } = await apiClient.get('/expenses/anomalies'); return data.data; } catch (e) { return []; } },
    resolveAnomaly: async (id) => { const { data } = await apiClient.patch(`/expenses/anomalies/${id}/resolve`); return data.data; },
};

// ===== ANALYTICS & DASHBOARD =====
export const analyticsService = {
    getKPIs: async () => { const { data } = await apiClient.get('/dashboard/kpis'); return data.data; },
    getFleetStatus: async () => { const { data } = await apiClient.get('/dashboard/fleet-status'); return data.data; },
    getSafetyScores: async () => { const { data } = await apiClient.get('/dashboard/safety-scores'); return data.data; },
    getCostBreakdown: async () => { const { data } = await apiClient.get('/dashboard/cost-breakdown'); return data.data; },
    getROI: async () => { const { data } = await apiClient.get('/analytics/roi'); return data.data; },
    getMapData: async () => { const { data } = await apiClient.get('/fleet-map/data'); return data.data; }
};

// ===== USERS =====
export const userService = {
    getAll: async () => { const { data } = await apiClient.get('/users'); return data.data; },
    create: async (user) => {
        try {
            const { data } = await apiClient.post('/users', user);
            return data.data;
        } catch (e) {
            return { error: e.response?.data?.message || 'Error creating user' };
        }
    },
    delete: async (id) => { await apiClient.delete(`/users/${id}`); } // Ensure backend has this!
};

// ===== AUTH =====
export const authService = {
    login: async (email, password) => {
        try {
            const { data } = await apiClient.post('/auth/login', { email, password });
            const token = data.data.token;
            localStorage.setItem('ff_token', token);
            // getting user details since /auth/login returns token+user in backend, but just in case:
            if (data.data.user) {
                localStorage.setItem('ff_user', JSON.stringify(data.data.user));
                return data.data.user;
            }

            const userResp = await apiClient.get('/auth/me');
            const user = userResp.data.data;
            localStorage.setItem('ff_user', JSON.stringify(user));
            return user;
        } catch (error) {
            return null;
        }
    },
    logout: () => {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
    },
    getUser: () => {
        const user = localStorage.getItem('ff_user');
        return user ? JSON.parse(user) : null;
    },
};

