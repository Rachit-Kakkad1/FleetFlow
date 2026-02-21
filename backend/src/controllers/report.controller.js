const reportService = require('../services/report.service');

const getFuelEfficiency = async (_req, res, next) => {
    try {
        const data = await reportService.getFuelEfficiency();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getCostPerKm = async (_req, res, next) => {
    try {
        const data = await reportService.getCostPerKm();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getVehicleROI = async (_req, res, next) => {
    try {
        const data = await reportService.getVehicleROI();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const exportCSV = async (req, res, next) => {
    try {
        const type = req.query.type || 'trips';
        const csv = await reportService.exportCSV(type);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=fleetflow-${type}-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

module.exports = { getFuelEfficiency, getCostPerKm, getVehicleROI, exportCSV };
