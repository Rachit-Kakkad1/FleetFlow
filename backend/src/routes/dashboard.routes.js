const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

router.get('/kpis', ctrl.getKPIs);
router.get('/fleet-status', ctrl.getFleetStatus);
router.get('/safety-scores', ctrl.getSafetyScores);
router.get('/cost-breakdown', ctrl.getCostBreakdown);

module.exports = router;
