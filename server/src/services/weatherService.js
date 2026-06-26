const pool = require('../database/pool');
const { demoMode } = require('../config');
const timezoneCache = new Map();

function weatherCodeIsThunderstorm(code) {
  return [95, 96, 99].includes(Number(code));
}

async function getWeather({ lat, lng, date, from, to }) {
  const startHour = Number(String(from || '12:00').split(':')[0]);
  const endHour = Number(String(to || from || '12:00').split(':')[0]);
  try {
    const [rows] = await pool.execute(
      `SELECT raw_json FROM weather_cache
       WHERE ROUND(lat, 2) = ROUND(?, 2) AND ROUND(lng, 2) = ROUND(?, 2)
       AND forecast_date = ? AND forecast_hour = ?
       AND JSON_UNQUOTE(JSON_EXTRACT(raw_json, '$.intervalTo')) = ?
       AND cached_at > NOW() - INTERVAL 30 MINUTE
       LIMIT 1`, [lat, lng, date, startHour, to]
    );
    if (rows.length) return typeof rows[0].raw_json === 'string' ? JSON.parse(rows[0].raw_json) : rows[0].raw_json;
  } catch (error) {
    if (process.env.NODE_ENV === 'production' && !demoMode) throw error;
  }

  const params = new URLSearchParams({
    latitude: lat, longitude: lng,
    hourly: 'temperature_2m,precipitation,wind_speed_10m,weather_code',
    timezone: 'auto', start_date: date, end_date: date,
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal:AbortSignal.timeout(12000) });
  if (!response.ok) throw Object.assign(new Error('Nie udało się pobrać pogody.'), { status: 502 });
  const data = await response.json();
  const indexes = (data.hourly?.time || []).map((_, index) => index).filter((index) => {
    const hour = Number(String(data.hourly.time[index]).slice(11, 13));
    return hour >= startHour && hour <= endHour;
  });
  if (!indexes.length) indexes.push(Math.max(0, Math.min(startHour, (data.hourly?.time?.length || 1) - 1)));
  const temperatures = indexes.map((index) => Number(data.hourly?.temperature_2m?.[index])).filter(Number.isFinite);
  const precipitation = indexes.reduce((sum, index) => sum + Number(data.hourly?.precipitation?.[index] || 0), 0);
  const windSpeed = Math.max(...indexes.map((index) => Number(data.hourly?.wind_speed_10m?.[index] || 0)));
  const weatherCodes = indexes.map((index) => Number(data.hourly?.weather_code?.[index]));
  const result = {
    available: true,
    temperature: temperatures.length ? Number((temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length).toFixed(1)) : null,
    precipitation: Number(precipitation.toFixed(1)),
    windSpeed: Number(windSpeed.toFixed(1)),
    thunderstorm: weatherCodes.some(weatherCodeIsThunderstorm),
    weatherCode: weatherCodes.find(weatherCodeIsThunderstorm) || weatherCodes.reduce((worst, code) => Math.max(worst, code), 0),
    intervalFrom: from,
    intervalTo: to,
    source: 'Open-Meteo',
  };
  try {
    await pool.execute(
      'INSERT INTO weather_cache (lat, lng, forecast_date, forecast_hour, raw_json) VALUES (?, ?, ?, ?, ?)',
      [lat, lng, date, startHour, JSON.stringify(result)]
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'production' && !demoMode) throw error;
  }
  return result;
}

async function getLocalTime({ lat, lng }) {
  const key = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
  const cached = timezoneCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const params = new URLSearchParams({ latitude:lat, longitude:lng, current:'temperature_2m', timezone:'auto', forecast_days:'1' });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal:AbortSignal.timeout(12000) });
  if (!response.ok) throw Object.assign(new Error('Nie udało się ustalić lokalnego dnia.'), { status:502 });
  const data = await response.json();
  const localDateTime = data.current?.time;
  if (!localDateTime) throw Object.assign(new Error('Brak czasu lokalnego dla tej lokalizacji.'), { status:502 });
  const value = { timezone:data.timezone, currentDate:localDateTime.slice(0,10), currentTime:localDateTime.slice(11,16) };
  timezoneCache.set(key, { value, expiresAt:Date.now() + 60 * 60 * 1000 });
  return value;
}

module.exports = { getWeather, getLocalTime };
