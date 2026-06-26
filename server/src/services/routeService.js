const { osrmFootUrl, nominatimUserAgent } = require('../config');

const cache = new Map();
let queue = Promise.resolve();
let nextRequestAt = 0;

function waitForTurn() {
  const turn = queue.then(async () => {
    const delay = Math.max(0, nextRequestAt - Date.now());
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    nextRequestAt = Date.now() + 1000;
  });
  queue = turn.catch(() => {});
  return turn;
}

function destination(lat, lng, distanceKm, bearingDegrees) {
  const radiusKm = 6371;
  const bearing = bearingDegrees * Math.PI / 180;
  const latitude = lat * Math.PI / 180;
  const longitude = lng * Math.PI / 180;
  const angularDistance = distanceKm / radiusKm;
  const resultLat = Math.asin(Math.sin(latitude) * Math.cos(angularDistance)
    + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing));
  const resultLng = longitude + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
    Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(resultLat)
  );
  return [resultLng * 180 / Math.PI, resultLat * 180 / Math.PI];
}

function loopWaypoints(lat, lng, targetDistanceKm, scale, orientation) {
  const radiusKm = Math.max(0.12, targetDistanceKm / (2 * Math.PI) * scale);
  const [centerLng, centerLat] = destination(lat, lng, radiusKm, orientation);
  const startAngle = orientation + 180;
  const points = [[lng, lat]];
  for (let index = 1; index < 6; index += 1) {
    points.push(destination(centerLat, centerLng, radiusKm, startAngle + index * 60));
  }
  points.push([lng, lat]);
  return points;
}

async function requestRoute(points) {
  const coordinates = points.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join(';');
  const url = `${osrmFootUrl}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false&continue_straight=true`;
  if (cache.has(url)) return cache.get(url);
  await waitForTurn();
  const response = await fetch(url, { headers: { 'User-Agent': nominatimUserAgent, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw Object.assign(new Error('Serwer tras pieszych OSRM jest chwilowo niedostępny.'), { status: 502 });
  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) throw Object.assign(new Error('Nie udało się utworzyć zamkniętej trasy w tej okolicy.'), { status: 422 });
  const route = data.routes[0];
  if (cache.size >= 100) cache.clear();
  cache.set(url, route);
  return route;
}

async function createRunningRoute({ lat, lng, targetDistanceKm, paceMinPerKm = 6, variant = 0 }) {
  const startLat = Number(lat); const startLng = Number(lng); const target = Number(targetDistanceKm);
  let scale = 1; let best = null; let orientation = 35 + (Math.abs(Number(variant)) % 8) * 43;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const points = loopWaypoints(startLat, startLng, target, scale, orientation);
    try {
      const candidate = await requestRoute(points);
      const distanceKm = candidate.distance / 1000;
      const error = Math.abs(distanceKm - target);
      if (!best || error < best.error) best = { candidate, distanceKm, error };
      if (error <= Math.max(0.1, target * 0.02)) break;
      scale *= Math.min(1.6, Math.max(0.55, target / distanceKm));
    } catch (error) {
      orientation += 73;
      scale = 1;
      if (attempt === 5 && !best) throw error;
    }
  }
  if (!best) throw Object.assign(new Error('Nie udało się utworzyć pętli biegowej.'), { status: 422 });
  const geometry = best.candidate.geometry;
  geometry.coordinates[0] = [startLng, startLat];
  geometry.coordinates[geometry.coordinates.length - 1] = [startLng, startLat];
  const actualDistanceKm = Number(best.distanceKm.toFixed(2));
  return {
    route: { type: 'Feature', properties: { provider: 'OSRM', profile: 'foot', closedLoop: true, variant: Number(variant) }, geometry },
    actualDistanceKm,
    targetDistanceKm: target,
    distanceDifferenceKm: Number((actualDistanceKm - target).toFixed(2)),
    estimatedDurationMinutes: Math.round(actualDistanceKm * paceMinPerKm),
    alternatives: [actualDistanceKm],
    provider: 'OSRM',
  };
}

module.exports = { createRunningRoute, loopWaypoints };
