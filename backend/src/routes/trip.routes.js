const router = require('express').Router();
const ctrl = require('../controllers/trip.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createTripSchema, completeTripSchema, uploadProofSchema, uploadSignatureSchema } = require('../validators/trip.schema');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/pending', authorize('MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'), ctrl.listPending);
router.get('/me', authorize('DRIVER'), ctrl.myTrips);
router.get('/:id', ctrl.getById);
router.post('/', authorize('MANAGER', 'DISPATCHER'), validate(createTripSchema), ctrl.create);
router.patch('/:id/approve', authorize('MANAGER', 'SAFETY_OFFICER'), ctrl.approve);
router.patch('/:id/decline', authorize('MANAGER', 'SAFETY_OFFICER'), ctrl.decline);
router.patch('/:id/accept', authorize('DRIVER'), ctrl.acceptTrip);
router.post('/:id/proof', authorize('DRIVER'), validate(uploadProofSchema), ctrl.uploadProof);
router.post('/:id/signature', authorize('DRIVER'), validate(uploadSignatureSchema), ctrl.uploadSignature);
router.patch('/:id/complete', authorize('MANAGER', 'DISPATCHER', 'DRIVER'), validate(completeTripSchema), ctrl.complete);
router.patch('/:id/verify-delivery', authorize('MANAGER', 'DISPATCHER'), ctrl.verifyDelivery);
router.patch('/:id/reject-delivery', authorize('MANAGER', 'DISPATCHER'), ctrl.rejectDelivery);
router.patch('/:id/cancel', authorize('MANAGER', 'DISPATCHER'), ctrl.cancel);

module.exports = router;
