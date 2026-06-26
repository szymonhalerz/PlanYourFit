const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { stats } = require('../controllers/statsController');
router.get('/:period', requireAuth, (req, res, next) => {
  if (!['week', 'month'].includes(req.params.period)) return res.status(400).json({ message: 'Dozwolony okres to week albo month.' });
  return asyncHandler(stats)(req, res, next);
});
module.exports = router;
