const router = require('express').Router();
const { login, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginSchema } = require('../validators/auth.schema');

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

module.exports = router;
