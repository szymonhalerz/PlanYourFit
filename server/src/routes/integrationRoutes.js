const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const integrations = require('../controllers/integrationController');
const routeGenerationLimit = rateLimit({ windowMs:3000, limit:1, standardHeaders:'draft-7', legacyHeaders:false, message:{ message:'Nową trasę możesz wygenerować raz na 3 sekundy.' } });
const placesSearchLimit = rateLimit({ windowMs:60 * 1000, limit:12, standardHeaders:'draft-7', legacyHeaders:false, message:{ message:'Wyszukiwanie miejsc jest chwilowo ograniczone. Spróbuj ponownie za minutę.' } });

router.get('/geocoding/reverse', asyncHandler(integrations.reverseLocation));
router.get('/geocoding/search', asyncHandler(integrations.searchLocation));
router.get('/timezone', asyncHandler(integrations.localTime));
router.get('/weather', asyncHandler(integrations.weather));
router.post('/recommendations/evaluate', integrations.recommendation);
router.post('/routes/running', routeGenerationLimit, asyncHandler(integrations.runningRoute));
router.get('/places', placesSearchLimit, asyncHandler(integrations.places));
router.use(requireAuth);
module.exports = router;
