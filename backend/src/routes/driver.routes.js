const router = require('express').Router();
const ctrl = require('../controllers/driver.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createDriverSchema, updateDriverSchema, updateDriverStatusSchema } = require('../validators/driver.schema');

router.use(authenticate);

router.get('/', authorize('MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'), ctrl.list);
router.get('/available', authorize('MANAGER', 'DISPATCHER'), ctrl.listAvailable);
router.get('/:id', authorize('MANAGER', 'SAFETY_OFFICER'), ctrl.getById);
router.post('/', authorize('MANAGER'), validate(createDriverSchema), ctrl.create);
router.put('/:id', authorize('MANAGER'), validate(updateDriverSchema), ctrl.update);
router.patch('/:id/status', authorize('MANAGER', 'SAFETY_OFFICER'), validate(updateDriverStatusSchema), ctrl.updateStatus);
router.delete('/:id', authorize('MANAGER'), ctrl.remove);

module.exports = router;
