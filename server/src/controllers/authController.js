const pool = require('../database/pool');
const demoStore = require('../database/demoStore');
const { demoMode } = require('../config');

const cookieOptions = {
  httpOnly: false,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const DEMO_EMAIL = 'demo@planyourfit.pl';
const DEMO_PASSWORD = 'Demo1234!';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  defaultLocation: user.defaultLocation ?? user.default_location,
  defaultPostalCode: user.defaultPostalCode ?? user.default_postal_code,
  defaultLocationLat: user.defaultLocationLat ?? user.default_location_lat,
  defaultLocationLng: user.defaultLocationLng ?? user.default_location_lng,
  preferredRadiusKm: user.preferredRadiusKm ?? user.preferred_radius_km,
  monthlyActivityGoal: user.monthlyActivityGoal ?? user.monthly_activity_goal ?? 12,
  theme: user.theme,
});

async function demoUser() {
  if (demoMode) return demoStore.user;
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = 1 LIMIT 1');
  return rows[0];
}

async function register(req, res) {
  res.status(405).json({ message: 'Rejestracja jest wyłączona. Użyj konta pokazowego.' });
}

async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return res.status(401).json({
      message: `Użyj danych konta pokazowego: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`,
    });
  }

  const user = await demoUser();
  if (!user) {
    return res.status(503).json({ message: 'Nie znaleziono domyślnego użytkownika.' });
  }

  res.cookie('demo_session', '1', cookieOptions).json({ user: publicUser(user) });
}

async function me(req, res) {
  const user = await demoUser();
  if (!user) {
    return res.status(404).json({ message: 'Nie znaleziono konta pokazowego.' });
  }
  res.json({ user: publicUser(user) });
}

function logout(req, res) {
  res.clearCookie('demo_session', cookieOptions).status(204).end();
}

module.exports = { register, login, me, logout, DEMO_EMAIL, DEMO_PASSWORD };
