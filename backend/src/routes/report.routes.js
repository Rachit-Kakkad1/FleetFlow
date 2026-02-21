const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

router.get('/fuel-efficiency', ctrl.getFuelEfficiency);
router.get('/cost-per-km', ctrl.getCostPerKm);
router.get('/vehicle-roi', authorize('FINANCIAL_ANALYST', 'MANAGER'), ctrl.getVehicleROI);
router.get('/export/csv', ctrl.exportCSV);

module.exports = router;
