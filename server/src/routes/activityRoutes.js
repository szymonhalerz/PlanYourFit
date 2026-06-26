const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const activity = require('../controllers/activityController');
const { activitySchema, activityStatusSchema } = require('../validation/schemas');

router.use(requireAuth);
router.get('/', asyncHandler(activity.list));
router.get('/:id', asyncHandler(activity.getOne));
router.post('/', validate(activitySchema), asyncHandler(activity.create));
router.patch('/:id/status', validate(activityStatusSchema), asyncHandler(activity.updateStatus));
router.put('/:id', validate(activitySchema), asyncHandler(activity.update));
router.delete('/:id', asyncHandler(activity.remove));
module.exports = router;
