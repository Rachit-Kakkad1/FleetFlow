const router = require('express').Router();
const ctrl = require('../controllers/trip.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createTripSchema, completeTripSchema } = require('../validators/trip.schema');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/pending', authorize('MANAGER', 'DISPATCHER'), ctrl.listPending);
router.get('/:id', ctrl.getById);
router.post('/', authorize('MANAGER', 'DISPATCHER'), validate(createTripSchema), ctrl.create);
router.patch('/:id/dispatch', authorize('MANAGER', 'DISPATCHER'), ctrl.dispatch);
router.patch('/:id/complete', authorize('MANAGER', 'DISPATCHER'), validate(completeTripSchema), ctrl.complete);
router.patch('/:id/cancel', authorize('MANAGER', 'DISPATCHER'), ctrl.cancel);

module.exports = router;
