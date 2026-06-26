const { getWeather, getLocalTime } = require('../services/weatherService');
const { searchPlaces } = require('../services/placesService');
const { createRunningRoute } = require('../services/routeService');
const { evaluateRecommendation } = require('../services/recommendationEngine');
const { reverseGeocode, geocode } = require('../services/geocodingService');

async function reverseLocation(req, res) {
  const lat = Number(req.query.lat); const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ message: 'Podaj poprawne współrzędne.' });
  }
  res.json({ location: await reverseGeocode({ lat, lng }) });
}

async function searchLocation(req, res) {
  const address = String(req.query.address || '').trim(); const postalCode = String(req.query.postalCode || '').trim();
  if (address.length < 2 || !/^\d{2}-\d{3}$/.test(postalCode)) {
    return res.status(400).json({ message: 'Podaj adres i kod pocztowy w formacie 00-000.' });
  }
  res.json({ location: await geocode({ address, postalCode }) });
}

async function weather(req, res) {
  const { lat, lng, date, from, to } = req.query;
  if (!lat || !lng || !date) return res.status(400).json({ message: 'Lokalizacja i data są wymagane.' });
  res.json({ weather: await getWeather({ lat, lng, date, from, to }) });
}

async function localTime(req, res) {
  const lat = Number(req.query.lat); const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ message:'Podaj poprawną lokalizację.' });
  }
  res.json(await getLocalTime({ lat, lng }));
}

async function places(req, res) {
  const { type } = req.query; const lat = Number(req.query.lat); const lng = Number(req.query.lng); const radiusKm = Number(req.query.radiusKm || 10);
  if (!['hall', 'pool'].includes(type) || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180 || radiusKm < 1 || radiusKm > 50) {
    return res.status(400).json({ message: 'Podaj poprawny typ, lokalizację i promień 1–50 km.' });
  }
  res.json({ places: await searchPlaces({ type, lat, lng, radiusKm }) });
}

async function runningRoute(req, res) {
  const { lat, lng, targetDistanceKm, paceMinPerKm, variant } = req.body;
  if (!lat || !lng || !targetDistanceKm || targetDistanceKm <= 0 || targetDistanceKm > 100) {
    return res.status(400).json({ message: 'Podaj poprawną lokalizację i dystans do 100 km.' });
  }
  res.json(await createRunningRoute({ lat, lng, targetDistanceKm: Number(targetDistanceKm), paceMinPerKm: Number(paceMinPerKm || 6), variant: Number(variant || 0) }));
}

function recommendation(req, res) { res.json({ recommendation: evaluateRecommendation(req.body) }); }

module.exports = { reverseLocation, searchLocation, localTime, weather, places, runningRoute, recommendation };
