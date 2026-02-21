const expenseService = require('../services/expense.service');

const list = async (req, res, next) => {
    try {
        const expenses = await expenseService.list(req.query);
        res.json({ success: true, data: expenses });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const expense = await expenseService.create(req.body);
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

const getTotalCost = async (req, res, next) => {
    try {
        const data = await expenseService.getTotalCostByVehicle(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getAnomalies = async (req, res, next) => {
    try {
        const anomalies = await expenseService.getAnomalies();
        res.json({ success: true, data: anomalies });
    } catch (error) {
        next(error);
    }
};

const resolveAnomaly = async (req, res, next) => {
    try {
        const result = await expenseService.resolveAnomaly(req.params.id);
        res.json({ success: true, message: 'Anomaly resolved', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, create, getTotalCost, getAnomalies, resolveAnomaly };
