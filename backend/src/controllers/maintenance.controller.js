const maintenanceService = require('../services/maintenance.service');

const list = async (req, res, next) => {
    try {
        const logs = await maintenanceService.list(req.query);
        res.json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
};

const listByVehicle = async (req, res, next) => {
    try {
        const logs = await maintenanceService.listByVehicle(req.params.vehicleId);
        res.json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const log = await maintenanceService.create(req.body);
        res.status(201).json({ success: true, data: log });
    } catch (error) {
        next(error);
    }
};

const complete = async (req, res, next) => {
    try {
        const log = await maintenanceService.complete(req.params.id);
        res.json({ success: true, message: 'Maintenance completed. Vehicle is now available.', data: log });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, listByVehicle, create, complete };
