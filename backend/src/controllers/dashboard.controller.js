const dashboardService = require('../services/dashboard.service');

const getKPIs = async (_req, res, next) => {
    try {
        const kpis = await dashboardService.getKPIs();
        res.json({ success: true, data: kpis });
    } catch (error) {
        next(error);
    }
};

const getFleetStatus = async (_req, res, next) => {
    try {
        const data = await dashboardService.getFleetStatus();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getSafetyScores = async (_req, res, next) => {
    try {
        const data = await dashboardService.getSafetyScores();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getCostBreakdown = async (_req, res, next) => {
    try {
        const data = await dashboardService.getCostBreakdown();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = { getKPIs, getFleetStatus, getSafetyScores, getCostBreakdown };
