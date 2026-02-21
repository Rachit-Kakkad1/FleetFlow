const router = require('express').Router();
const { create, list, remove } = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { createUserSchema } = require('../validators/user.schema');

// All user routes require Manager role
router.use(authenticate, authorize('MANAGER'));

router.post('/', validate(createUserSchema), create);
router.get('/', list);

router.delete('/:id', remove);

module.exports = router;
