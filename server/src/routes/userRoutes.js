const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const user = require('../controllers/userController');
const { profileSchema, changePasswordSchema, activityGoalSchema } = require('../validation/schemas');

router.use(requireAuth);
router.put('/me', validate(profileSchema), asyncHandler(user.updateProfile));
router.put('/me/password', validate(changePasswordSchema), asyncHandler(user.changePassword));
router.put('/me/activity-goal', validate(activityGoalSchema), asyncHandler(user.updateActivityGoal));
module.exports = router;
