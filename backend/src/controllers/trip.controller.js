const tripService = require('../services/trip.service');

const list = async (req, res, next) => {
    try {
        const trips = await tripService.list(req.query);
        res.json({ success: true, data: trips });
    } catch (error) {
        next(error);
    }
};

const listPending = async (_req, res, next) => {
    try {
        const trips = await tripService.listPending();
        res.json({ success: true, data: trips });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const trip = await tripService.getById(req.params.id);
        res.json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const trip = await tripService.create(req.body);
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
};

const dispatch = async (req, res, next) => {
    try {
        const result = await tripService.dispatch(req.params.id);
        res.json({ success: true, message: 'Trip dispatched.', data: result });
    } catch (error) {
        next(error);
    }
};

const complete = async (req, res, next) => {
    try {
        const result = await tripService.complete(req.params.id, req.body.endOdometerKm);
        res.json({ success: true, message: 'Trip completed.', data: result });
    } catch (error) {
        next(error);
    }
};

const cancel = async (req, res, next) => {
    try {
        const result = await tripService.cancel(req.params.id);
        res.json({ success: true, message: 'Trip cancelled.', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, listPending, getById, create, dispatch, complete, cancel };
