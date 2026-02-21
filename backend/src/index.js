require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

// ─── Route imports ───
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const tripRoutes = require('./routes/trip.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const expenseRoutes = require('./routes/expense.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const fleetMapRoutes = require('./routes/fleetMap.routes');

const app = express();

// ─── Global Middleware ───
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ─── Health check ───
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fleet-map', fleetMapRoutes);

// ─── 404 handler ───
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ───
app.use(errorHandler);

// ─── Start server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚛 FleetFlow API running on http://localhost:${PORT}`);
});

module.exports = app;
