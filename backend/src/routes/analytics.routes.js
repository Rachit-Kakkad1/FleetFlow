const router = require('express').Router();
const dashboardCtrl = require('../controllers/dashboard.controller');
const reportCtrl = require('../controllers/report.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// ─── Aliases: /analytics/* → existing dashboard/report controllers ───
router.get('/kpis', dashboardCtrl.getKPIs);
router.get('/fleet-status', dashboardCtrl.getFleetStatus);
router.get('/safety-scores', dashboardCtrl.getSafetyScores);
router.get('/cost-breakdown', dashboardCtrl.getCostBreakdown);
router.get('/roi', authorize('FINANCIAL_ANALYST', 'MANAGER'), reportCtrl.getVehicleROI);
router.get('/export/:type', authorize('FINANCIAL_ANALYST', 'MANAGER'), reportCtrl.exportCSV);

module.exports = router;
