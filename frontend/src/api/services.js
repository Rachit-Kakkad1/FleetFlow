// FleetFlow API Service Layer
// Currently uses localStorage. Backend team can swap these with fetch() calls.

const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const generateId = (prefix) => `${prefix}${String(getStore(`ff_${prefix.toLowerCase()}s`).length + 1).padStart(3, '0')}`;

// ===== VEHICLES =====
export const vehicleService = {
    getAll: () => getStore('ff_vehicles'),
    getById: (id) => getStore('ff_vehicles').find(v => v.id === id),
    getAvailable: () => getStore('ff_vehicles').filter(v => v.status === 'Available'),

    create: (vehicle) => {
        const vehicles = getStore('ff_vehicles');
        const newVehicle = {
            ...vehicle,
            id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
            status: 'Available',
        };
        vehicles.push(newVehicle);
        setStore('ff_vehicles', vehicles);
        return newVehicle;
    },

    update: (id, updates) => {
        const vehicles = getStore('ff_vehicles');
        const idx = vehicles.findIndex(v => v.id === id);
        if (idx === -1) return null;
        vehicles[idx] = { ...vehicles[idx], ...updates };
        setStore('ff_vehicles', vehicles);
        return vehicles[idx];
    },

    updateStatus: (id, status) => {
        return vehicleService.update(id, { status });
    },

    delete: (id) => {
        const vehicles = getStore('ff_vehicles').filter(v => v.id !== id);
        setStore('ff_vehicles', vehicles);
    },
};

// ===== DRIVERS =====
export const driverService = {
    getAll: () => getStore('ff_drivers'),
    getById: (id) => getStore('ff_drivers').find(d => d.id === id),
    getAvailable: () => getStore('ff_drivers').filter(d =>
        d.status === 'On Duty' && new Date(d.licenseExpiry) > new Date()
    ),

    create: (driver) => {
        const drivers = getStore('ff_drivers');
        const newDriver = {
            ...driver,
            id: `D${String(drivers.length + 1).padStart(3, '0')}`,
            safetyScore: 100,
            tripsCompleted: 0,
            tripsAssigned: 0,
        };
        drivers.push(newDriver);
        setStore('ff_drivers', drivers);
        return newDriver;
    },

    update: (id, updates) => {
        const drivers = getStore('ff_drivers');
        const idx = drivers.findIndex(d => d.id === id);
        if (idx === -1) return null;
        drivers[idx] = { ...drivers[idx], ...updates };
        setStore('ff_drivers', drivers);
        return drivers[idx];
    },

    updateStatus: (id, status) => {
        return driverService.update(id, { status });
    },

    delete: (id) => {
        const drivers = getStore('ff_drivers').filter(d => d.id !== id);
        setStore('ff_drivers', drivers);
    },

    isLicenseExpired: (driver) => new Date(driver.licenseExpiry) < new Date(),
    isLicenseExpiringSoon: (driver) => {
        const expiry = new Date(driver.licenseExpiry);
        const now = new Date();
        const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    },
};

// ===== TRIPS =====
export const tripService = {
    getAll: () => getStore('ff_trips'),
    getById: (id) => getStore('ff_trips').find(t => t.id === id),
    getPending: () => getStore('ff_trips').filter(t => t.status === 'Draft'),

    create: (trip) => {
        const trips = getStore('ff_trips');
        const newTrip = {
            ...trip,
            id: `T${String(trips.length + 1).padStart(3, '0')}`,
            status: 'Draft',
            createdAt: new Date().toISOString().split('T')[0],
            startOdometer: null,
            endOdometer: null,
        };
        trips.push(newTrip);
        setStore('ff_trips', trips);
        return newTrip;
    },

    dispatch: (id) => {
        const trips = getStore('ff_trips');
        const trip = trips.find(t => t.id === id);
        if (!trip) return null;
        trip.status = 'Dispatched';
        setStore('ff_trips', trips);
        // Update vehicle & driver status
        vehicleService.updateStatus(trip.vehicleId, 'On Trip');
        driverService.updateStatus(trip.driverId, 'On Trip');
        return trip;
    },

    complete: (id, endOdometer) => {
        const trips = getStore('ff_trips');
        const trip = trips.find(t => t.id === id);
        if (!trip) return null;
        trip.status = 'Completed';
        trip.endOdometer = endOdometer;
        setStore('ff_trips', trips);
        // Update vehicle & driver status
        vehicleService.updateStatus(trip.vehicleId, 'Available');
        driverService.updateStatus(trip.driverId, 'On Duty');
        // Update vehicle odometer
        vehicleService.update(trip.vehicleId, { odometer: endOdometer });
        return trip;
    },

    cancel: (id) => {
        const trips = getStore('ff_trips');
        const trip = trips.find(t => t.id === id);
        if (!trip) return null;
        const wasDispatched = trip.status === 'Dispatched';
        trip.status = 'Cancelled';
        setStore('ff_trips', trips);
        if (wasDispatched) {
            vehicleService.updateStatus(trip.vehicleId, 'Available');
            driverService.updateStatus(trip.driverId, 'On Duty');
        }
        return trip;
    },
};

// ===== MAINTENANCE =====
export const maintenanceService = {
    getAll: () => getStore('ff_maintenance'),

    create: (log) => {
        const logs = getStore('ff_maintenance');
        const newLog = {
            ...log,
            id: `M${String(logs.length + 1).padStart(3, '0')}`,
            completed: false,
        };
        logs.push(newLog);
        setStore('ff_maintenance', logs);
        // Auto-logic: set vehicle "In Shop"
        vehicleService.updateStatus(log.vehicleId, 'In Shop');
        return newLog;
    },

    complete: (id) => {
        const logs = getStore('ff_maintenance');
        const log = logs.find(l => l.id === id);
        if (!log) return null;
        log.completed = true;
        setStore('ff_maintenance', logs);
        // Return vehicle to "Available"
        vehicleService.updateStatus(log.vehicleId, 'Available');
        return log;
    },

    getByVehicle: (vehicleId) => getStore('ff_maintenance').filter(l => l.vehicleId === vehicleId),
};

// ===== EXPENSES =====
export const expenseService = {
    getAll: () => getStore('ff_expenses'),

    create: (expense) => {
        const expenses = getStore('ff_expenses');
        const newExpense = {
            ...expense,
            id: `E${String(expenses.length + 1).padStart(3, '0')}`,
        };
        expenses.push(newExpense);
        setStore('ff_expenses', expenses);
        return newExpense;
    },

    getByVehicle: (vehicleId) => getStore('ff_expenses').filter(e => e.vehicleId === vehicleId),

    getTotalCostByVehicle: (vehicleId) => {
        const expenses = getStore('ff_expenses').filter(e => e.vehicleId === vehicleId);
        const maintenance = getStore('ff_maintenance').filter(m => m.vehicleId === vehicleId);
        const fuelCost = expenses.reduce((sum, e) => sum + e.cost, 0);
        const maintCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
        return { fuelCost, maintCost, total: fuelCost + maintCost };
    },
};

// ===== REGISTERED USERS =====
export const userService = {
    getAll: () => getStore('ff_users'),

    findByEmail: (email) =>
        getStore('ff_users').find(u => u.email.toLowerCase() === email.toLowerCase()),

    create: (user) => {
        const users = getStore('ff_users');
        if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
            return { error: 'A user with this email already exists' };
        }
        const newUser = {
            id: `U${String(users.length + 1).padStart(3, '0')}`,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: new Date().toISOString().split('T')[0],
        };
        users.push(newUser);
        setStore('ff_users', users);
        return newUser;
    },

    delete: (id) => {
        const users = getStore('ff_users').filter(u => u.id !== id);
        setStore('ff_users', users);
    },
};

// ===== AUTH =====
export const authService = {
    login: (email, password) => {
        const user = userService.findByEmail(email);
        if (!user || user.password !== password) return null;
        const sessionUser = { email: user.email, role: user.role, name: user.name };
        localStorage.setItem('ff_user', JSON.stringify(sessionUser));
        return sessionUser;
    },
    logout: () => {
        localStorage.removeItem('ff_user');
    },
    getUser: () => {
        const user = localStorage.getItem('ff_user');
        return user ? JSON.parse(user) : null;
    },
};
