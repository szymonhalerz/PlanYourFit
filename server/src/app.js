const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { clientUrl } = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');
const path = require('path');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.js') || req.path.endsWith('.css')) res.set('Cache-Control', 'no-store, max-age=0');
  next();
});
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'PlanYourFit API' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api', require('./routes/integrationRoutes'));
const clientDir = path.resolve(__dirname, '../../client');
app.use('/images', express.static(path.join(clientDir, 'public/images')));
app.use(express.static(clientDir));
app.get('*splat', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(clientDir, 'index.html')));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
