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

const myTrips = async (req, res, next) => {
    try {
        const trips = await tripService.getMyTrips(req.user.email);
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

const approve = async (req, res, next) => {
    try {
        const result = await tripService.approve(req.params.id, req.body);
        res.json({ success: true, message: 'Trip approved.', data: result });
    } catch (error) {
        next(error);
    }
};

const decline = async (req, res, next) => {
    try {
        const result = await tripService.decline(req.params.id, req.body.reason, req.body.photoUrl);
        res.json({ success: true, message: 'Trip declined.', data: result });
    } catch (error) {
        next(error);
    }
};

const acceptTrip = async (req, res, next) => {
    try {
        const result = await tripService.acceptTrip(req.params.id);
        res.json({ success: true, message: 'Trip accepted by driver.', data: result });
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

const uploadProof = async (req, res, next) => {
    try {
        const result = await tripService.uploadProof(req.params.id, req.body);
        res.json({ success: true, message: 'Delivery proof uploaded', data: result });
    } catch (error) {
        next(error);
    }
};

const uploadSignature = async (req, res, next) => {
    try {
        const result = await tripService.uploadSignature(req.params.id, req.body);
        res.json({ success: true, message: 'Signature uploaded', data: result });
    } catch (error) {
        next(error);
    }
};

const verifyDelivery = async (req, res, next) => {
    try {
        const result = await tripService.verifyDelivery(req.params.id);
        res.json({ success: true, message: 'Delivery verified successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const rejectDelivery = async (req, res, next) => {
    try {
        const result = await tripService.rejectDelivery(req.params.id, req.body.reason);
        res.json({ success: true, message: 'Delivery rejected.', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, listPending, myTrips, getById, create, approve, decline, acceptTrip, complete, cancel, uploadProof, uploadSignature, verifyDelivery, rejectDelivery };
