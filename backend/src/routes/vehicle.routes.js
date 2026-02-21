const router = require('express').Router();
const ctrl = require('../controllers/vehicle.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createVehicleSchema, updateVehicleSchema } = require('../validators/vehicle.schema');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/available', ctrl.listAvailable);
router.get('/:id', ctrl.getById);
router.post('/', authorize('MANAGER'), validate(createVehicleSchema), ctrl.create);
router.put('/:id', authorize('MANAGER'), validate(updateVehicleSchema), ctrl.update);
router.patch('/:id/status', authorize('MANAGER'), ctrl.updateStatus);
router.patch('/:id/retire', authorize('MANAGER'), ctrl.retire);
router.delete('/:id', authorize('MANAGER'), ctrl.remove);

module.exports = router;
