const vehicleService = require('../services/vehicle.service');

const list = async (req, res, next) => {
    try {
        const vehicles = await vehicleService.list(req.query);
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
};

const listAvailable = async (_req, res, next) => {
    try {
        const vehicles = await vehicleService.listAvailable();
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.getById(req.params.id);
        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.create(req.body);
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.update(req.params.id, req.body);
        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.updateStatus(req.params.id, req.body.status);
        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

const retire = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.retire(req.params.id);
        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await vehicleService.remove(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = { list, listAvailable, getById, create, update, updateStatus, retire, remove };
