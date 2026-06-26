const router = require('express').Router();
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../controllers/authController');
const { loginSchema } = require('../validation/schemas');

router.post('/register', auth.register);
router.post('/login', validate(loginSchema), asyncHandler(auth.login));
router.post('/logout', auth.logout);
router.get('/me', requireAuth, asyncHandler(auth.me));
module.exports = router;
