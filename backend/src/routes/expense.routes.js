const router = require('express').Router();
const ctrl = require('../controllers/expense.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createExpenseSchema } = require('../validators/expense.schema');

router.use(authenticate);

router.get('/', authorize('MANAGER', 'FINANCIAL_ANALYST'), ctrl.list);
router.post('/', authorize('MANAGER', 'FINANCIAL_ANALYST', 'DRIVER'), validate(createExpenseSchema), ctrl.create);
router.get('/vehicle/:id/total', authorize('MANAGER', 'FINANCIAL_ANALYST'), ctrl.getTotalCost);
router.get('/anomalies', authorize('MANAGER'), ctrl.getAnomalies);
router.patch('/anomalies/:id/resolve', authorize('MANAGER'), ctrl.resolveAnomaly);

module.exports = router;
