const driverService = require('../services/driver.service');

const list = async (req, res, next) => {
    try {
        const drivers = await driverService.list(req.query);
        res.json({ success: true, data: drivers });
    } catch (error) {
        next(error);
    }
};

const listAvailable = async (_req, res, next) => {
    try {
        const drivers = await driverService.listAvailable();
        res.json({ success: true, data: drivers });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const driver = await driverService.getById(req.params.id);
        res.json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const driver = await driverService.create(req.body);
        res.status(201).json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const driver = await driverService.update(req.params.id, req.body);
        res.json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const driver = await driverService.updateStatus(req.params.id, req.body.status);
        res.json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await driverService.remove(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const triggerSos = async (req, res, next) => {
    try {
        const result = await driverService.triggerSos(req.body);
        res.status(201).json({ success: true, message: 'SOS triggered', data: result });
    } catch (error) {
        next(error);
    }
}

module.exports = { list, listAvailable, getById, create, update, updateStatus, remove, triggerSos };
