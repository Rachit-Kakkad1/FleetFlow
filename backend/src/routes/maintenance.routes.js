const router = require('express').Router();
const ctrl = require('../controllers/maintenance.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createMaintenanceSchema } = require('../validators/maintenance.schema');

router.use(authenticate);

router.get('/', authorize('MANAGER', 'SAFETY_OFFICER'), ctrl.list);
router.get('/vehicle/:vehicleId', authorize('MANAGER', 'SAFETY_OFFICER'), ctrl.listByVehicle);
router.post('/', authorize('MANAGER'), validate(createMaintenanceSchema), ctrl.create);
router.patch('/:id/complete', authorize('MANAGER'), ctrl.complete);

module.exports = router;
