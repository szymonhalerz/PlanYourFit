const { nominatimUserAgent } = require('../config')

const BASE_URL = 'https://nominatim.openstreetmap.org'
const cache = new Map()
let queue = Promise.resolve()
let nextRequestAt = 0

function waitForTurn() {
	const turn = queue.then(async () => {
		const delay = Math.max(0, nextRequestAt - Date.now())
		if (delay) await new Promise(resolve => setTimeout(resolve, delay))
		nextRequestAt = Date.now() + 1000
	})
	queue = turn.catch(() => {})
	return turn
}

function normalize(result) {
	const details = result.address || {}
	const street = [details.road || details.pedestrian || details.footway || details.amenity, details.house_number]
		.filter(Boolean)
		.join(' ')
	const city = details.city || details.town || details.village || details.municipality || details.county
	return {
		lat: Number(result.lat),
		lng: Number(result.lon),
		address: [street, city].filter(Boolean).join(', ') || result.display_name,
		postalCode: details.postcode || '',
		displayName: result.display_name,
		attribution: '© OpenStreetMap contributors',
	}
}

async function nominatim(path, params) {
	const url = `${BASE_URL}${path}?${new URLSearchParams({ format: 'jsonv2', addressdetails: '1', ...params })}`
	if (cache.has(url)) return cache.get(url)
	await waitForTurn()
	const response = await fetch(url, {
		headers: { 'User-Agent': nominatimUserAgent, 'Accept-Language': 'pl', Accept: 'application/json' },
	})
	if (!response.ok) {
		const body = await response.text().catch(() => '<unable to read body>')
		console.error('Nominatim request failed', { url, status: response.status, statusText: response.statusText, body })
		throw Object.assign(new Error('Nie udało się ustalić adresu lokalizacji.'), { status: 502 })
	}
	const data = await response.json()
	if (cache.size >= 200) cache.clear()
	cache.set(url, data)
	return data
}

async function reverseGeocode({ lat, lng }) {
	const result = await nominatim('/reverse', { lat: String(lat), lon: String(lng), zoom: '18' })
	if (!result?.lat) throw Object.assign(new Error('Nie znaleziono adresu dla tej lokalizacji.'), { status: 404 })
	return normalize(result)
}

async function geocode({ address, postalCode }) {
	const query = [address, postalCode, 'Polska'].filter(Boolean).join(', ')
	const results = await nominatim('/search', { q: query, countrycodes: 'pl', limit: '1' })
	if (!results.length) throw Object.assign(new Error('Nie znaleziono podanego adresu.'), { status: 404 })
	return normalize(results[0])
}

module.exports = { reverseGeocode, geocode }
