const pool = require('../database/pool');
const demoStore = require('../database/demoStore');
const { demoMode } = require('../config');

async function updateProfile(req, res) {
  if (demoMode) { Object.assign(demoStore.user, req.body); return res.json({ message:'Ustawienia konta pokazowego zostały zapisane.' }); }
  const [emailOwner] = await pool.execute('SELECT id FROM users WHERE email=? AND id<>? LIMIT 1', [req.body.email.toLowerCase(), req.user.id]);
  if (emailOwner.length) return res.status(409).json({ message: 'Ten adres e-mail jest już używany.' });
  await pool.execute(`UPDATE users SET name=?, email=?, default_location=?, default_postal_code=?, default_location_lat=?, default_location_lng=?, preferred_radius_km=?, theme=? WHERE id=?`,
    [req.body.name, req.body.email.toLowerCase(), req.body.defaultLocation, req.body.defaultPostalCode, req.body.defaultLocationLat ?? null, req.body.defaultLocationLng ?? null, req.body.preferredRadiusKm, req.body.theme, req.user.id]);
  res.json({ message: 'Ustawienia konta zostały zapisane.' });
}

async function changePassword(req, res) {
  res.status(405).json({ message: 'Konto pokazowe ma stałe, jawne hasło: Demo1234!' });
}

async function updateActivityGoal(req, res) {
  if (demoMode) { demoStore.user.monthlyActivityGoal = req.body.monthlyActivityGoal; return res.json({ message:'Miesięczny cel został zapisany.', monthlyActivityGoal:req.body.monthlyActivityGoal }); }
  await pool.execute('UPDATE users SET monthly_activity_goal=? WHERE id=?', [req.body.monthlyActivityGoal, req.user.id]);
  res.json({ message:'Miesięczny cel został zapisany.', monthlyActivityGoal:req.body.monthlyActivityGoal });
}

module.exports = { updateProfile, changePassword, updateActivityGoal };
