const router = require('express').Router();
const ctrl = require('../controllers/expense.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createExpenseSchema } = require('../validators/expense.schema');

router.use(authenticate);

router.get('/', authorize('MANAGER', 'FINANCIAL_ANALYST'), ctrl.list);
router.post('/', authorize('MANAGER', 'FINANCIAL_ANALYST'), validate(createExpenseSchema), ctrl.create);
router.get('/vehicle/:id/total', authorize('MANAGER', 'FINANCIAL_ANALYST'), ctrl.getTotalCost);

module.exports = router;
