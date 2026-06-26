const { overpassUrl, nominatimUserAgent } = require('../config');
const { reverseGeocode } = require('./geocodingService');

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function haversine(lat1, lng1, lat2, lng2) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildOverpassQuery({ type, lat, lng, radiusKm }) {
  const around = `around:${Math.round(radiusKm * 1000)},${lat},${lng}`;
  const selectors = type === 'pool'
    ? [
      `nwr(${around})["leisure"="swimming_pool"]`,
      `nwr(${around})["amenity"="swimming_pool"]`,
      `nwr(${around})["leisure"="sports_centre"]["sport"~"swimming",i]`,
    ]
    : [
      `nwr(${around})["building"="sports_hall"]`,
      `nwr(${around})["leisure"="sports_hall"]`,
      `nwr(${around})["leisure"="sports_centre"]["sport"~"basketball|multi",i]`,
      `nwr(${around})["sport"="basketball"]["indoor"~"yes|indoor",i]`,
    ];
  return `[out:json][timeout:20];(${selectors.map((selector) => `${selector};`).join('')});out body center 100;`;
}

function formatAddress(tags = {}) {
  if (tags['addr:full']) return tags['addr:full'];
  const street = tags['addr:street'] || tags['addr:place'];
  const line = [street, tags['addr:housenumber']].filter(Boolean).join(' ');
  const locality = tags['addr:city'] || tags['addr:town'] || tags['addr:village'];
  return [line, locality].filter(Boolean).join(', ') || tags['contact:address'] || 'Brak pełnego adresu w OpenStreetMap';
}

function mapElements(elements, { type, lat, lng, radiusKm }) {
  const places = elements
    .map((element) => {
      const placeLat = Number(element.lat ?? element.center?.lat);
      const placeLng = Number(element.lon ?? element.center?.lon);
      const tags = element.tags || {};
      if (!Number.isFinite(placeLat) || !Number.isFinite(placeLng) || tags.access === 'private') return null;
      const distanceKm = haversine(lat, lng, placeLat, placeLng);
      if (distanceKm > radiusKm) return null;
      const fallbackName = type === 'pool' ? 'Basen' : 'Hala sportowa';
      return {
        id:`osm-${element.type}-${element.id}`,
        name:tags.name || tags['name:pl'] || fallbackName,
        address:formatAddress(tags),
        postalCode:tags['addr:postcode'] || '',
        lat:placeLat,
        lng:placeLng,
        distanceKm:Number(distanceKm.toFixed(1)),
        source:'OpenStreetMap',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const unique = new Map();
  places.forEach((place) => {
    const generic = place.name === 'Basen' || place.name === 'Hala sportowa';
    const key = generic ? place.id : place.name.toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!unique.has(key)) unique.set(key, place);
  });
  return [...unique.values()].slice(0, 3);
}

async function searchPlaces({ type, lat, lng, radiusKm }) {
  const key = `${type}:${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}:${radiusKm}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.places;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(overpassUrl, {
      method:'POST',
      headers:{ 'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent':nominatimUserAgent },
      body:new URLSearchParams({ data:buildOverpassQuery({ type, lat, lng, radiusKm }) }),
      signal:controller.signal,
    });
    if (!response.ok) throw Object.assign(new Error('Overpass API jest chwilowo niedostępne. Spróbuj ponownie za moment.'), { status:502 });
    const data = await response.json();
    const mapped = mapElements(data.elements || [], { type, lat, lng, radiusKm });
    const places = await Promise.all(mapped.map(async (place) => {
      if (place.address !== 'Brak pełnego adresu w OpenStreetMap') return place;
      try {
        const location = await reverseGeocode({ lat:place.lat, lng:place.lng });
        return { ...place, address:location.address, postalCode:location.postalCode || place.postalCode };
      } catch { return place; }
    }));
    cache.set(key, { savedAt:Date.now(), places });
    return places;
  } catch (error) {
    if (error.name === 'AbortError') throw Object.assign(new Error('Wyszukiwanie miejsc trwało zbyt długo. Spróbuj ponownie.'), { status:504 });
    throw error;
  } finally { clearTimeout(timeout); }
}

module.exports = { searchPlaces, buildOverpassQuery, mapElements, haversine };
