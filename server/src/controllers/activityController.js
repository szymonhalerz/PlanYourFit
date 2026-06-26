const pool = require('../database/pool');
const demoStore = require('../database/demoStore');
const { demoMode } = require('../config');

const SELECT_ACTIVITY = `SELECT a.*, bd.court_type, bd.selected_place_id AS basketball_place_id,
 bd.weather_summary_json AS basketball_weather_json, bd.recommendation_status AS basketball_recommendation_status, bd.recommendation_reason AS basketball_recommendation_reason,
 rd.target_distance_km, rd.actual_distance_km, rd.pace_min_per_km, rd.estimated_duration_minutes, rd.route_geojson,
 rd.weather_summary_json AS running_weather_json, rd.recommendation_status AS running_recommendation_status,
 sd.selected_place_id AS swimming_place_id, sd.weather_summary_json AS swimming_weather_json,
 sd.recommendation_status AS swimming_recommendation_status, sd.recommendation_reason AS swimming_recommendation_reason
 FROM activities a
 LEFT JOIN basketball_details bd ON bd.activity_id = a.id
 LEFT JOIN running_details rd ON rd.activity_id = a.id
 LEFT JOIN swimming_details sd ON sd.activity_id = a.id`;

function mapActivity(row) {
  const parseJson = (value) => typeof value === 'string' ? JSON.parse(value) : value;
  const weather = parseJson(row.running_weather_json || row.basketball_weather_json || row.swimming_weather_json);
  const recommendationStatus = row.running_recommendation_status || row.basketball_recommendation_status || row.swimming_recommendation_status;
  const recommendationReason = row.basketball_recommendation_reason || row.swimming_recommendation_reason;
  return {
    id: row.id, activityType: row.activity_type, title: row.title,
    activityDate: row.activity_date instanceof Date ? row.activity_date.toISOString().slice(0, 10) : row.activity_date,
    startTime: String(row.start_time).slice(0, 5), endTime: String(row.end_time).slice(0, 5),
    locationLat: row.location_lat, locationLng: row.location_lng, locationAddress: row.location_address, postalCode: row.postal_code,
    note: row.note, status: row.status, searchRadiusKm: row.search_radius_km,
    details: {
      courtType: row.court_type, selectedPlaceId: row.basketball_place_id || row.swimming_place_id,
      targetDistanceKm: row.target_distance_km, actualDistanceKm: row.actual_distance_km,
      paceMinPerKm: row.pace_min_per_km, estimatedDurationMinutes: row.estimated_duration_minutes,
      routeGeojson: typeof row.route_geojson === 'string' ? JSON.parse(row.route_geojson) : row.route_geojson,
      weather,
      recommendation: recommendationStatus ? { status: recommendationStatus, message: recommendationReason || 'Ocena warunków pogodowych dla tej aktywności.' } : null,
    },
  };
}

async function list(req, res) {
  const { from, to, type, search } = req.query;
  if (demoMode) {
    let activities = demoStore.listActivities();
    if (from) activities = activities.filter((item) => item.activityDate >= from);
    if (to) activities = activities.filter((item) => item.activityDate <= to);
    if (type) activities = activities.filter((item) => item.activityType === type);
    if (search) { const query=String(search).toLocaleLowerCase('pl-PL'); activities=activities.filter((item)=>[item.title,item.locationAddress,item.postalCode,item.note].some((value)=>String(value||'').toLocaleLowerCase('pl-PL').includes(query))); }
    return res.json({ activities:activities.sort((a,b)=>`${a.activityDate}${a.startTime}`.localeCompare(`${b.activityDate}${b.startTime}`)) });
  }
  const conditions = ['a.user_id = ?']; const params = [req.user.id];
  if (from) { conditions.push('a.activity_date >= ?'); params.push(from); }
  if (to) { conditions.push('a.activity_date <= ?'); params.push(to); }
  if (type) { conditions.push('a.activity_type = ?'); params.push(type); }
  if (search) { conditions.push('(a.title LIKE ? OR a.location_address LIKE ? OR a.postal_code LIKE ? OR a.note LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
  const [rows] = await pool.execute(`${SELECT_ACTIVITY} WHERE ${conditions.join(' AND ')} ORDER BY a.activity_date, a.start_time`, params);
  res.json({ activities: rows.map(mapActivity) });
}

async function getOne(req, res) {
  if (demoMode) { const activity=demoStore.getActivity(req.params.id); return activity ? res.json({ activity }) : res.status(404).json({ message:'Nie znaleziono aktywności.' }); }
  const [rows] = await pool.execute(`${SELECT_ACTIVITY} WHERE a.id = ? AND a.user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Nie znaleziono aktywności.' });
  res.json({ activity: mapActivity(rows[0]) });
}

async function assertNoOverlap(connection, userId, data, excludeId = null) {
  const params = [userId, data.activityDate, data.endTime, data.startTime];
  let query = `SELECT id, title FROM activities WHERE user_id = ? AND activity_date = ?
    AND start_time < ? AND end_time > ?`;
  if (excludeId) { query += ' AND id <> ?'; params.push(excludeId); }
  const [rows] = await connection.execute(query, params);
  return rows;
}

async function insertDetails(connection, activityId, data) {
  const d = data.details || {};
  if (data.activityType === 'basketball') {
    await connection.execute(`INSERT INTO basketball_details
      (activity_id, court_type, selected_place_id, weather_summary_json, recommendation_status, recommendation_reason)
      VALUES (?, ?, ?, ?, ?, ?)`, [activityId, d.courtType || 'outdoor', d.selectedPlaceId || null, JSON.stringify(d.weather || null), d.recommendation?.status || 'unknown', d.recommendation?.message || null]);
  }
  if (data.activityType === 'running') {
    await connection.execute(`INSERT INTO running_details
      (activity_id, target_distance_km, actual_distance_km, pace_min_per_km, estimated_duration_minutes, route_geojson, weather_summary_json, recommendation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [activityId, d.targetDistanceKm, d.actualDistanceKm || null, d.paceMinPerKm || null, d.estimatedDurationMinutes || null, JSON.stringify(d.routeGeojson || null), JSON.stringify(d.weather || null), d.recommendation?.status || 'unknown']);
  }
  if (data.activityType === 'swimming') {
    await connection.execute(`INSERT INTO swimming_details
      (activity_id, selected_place_id, weather_summary_json, recommendation_status, recommendation_reason)
      VALUES (?, ?, ?, ?, ?)`, [activityId, d.selectedPlaceId || null, JSON.stringify(d.weather || null), d.recommendation?.status || 'unknown', d.recommendation?.message || null]);
  }
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);
}

async function create(req, res) {
  if (demoMode) {
    const overlap = demoStore.listActivities().find((item) => item.activityDate === req.body.activityDate && item.startTime < req.body.endTime && item.endTime > req.body.startTime);
    if (overlap && req.query.allowOverlap !== 'true') return res.status(409).json({ message:`Termin nachodzi na: ${overlap.title}.`, overlaps:[overlap] });
    const ids = demoStore.createActivities(req.body);
    return res.status(201).json({ message:ids.length > 1 ? `Dodano ${ids.length} powtarzających się aktywności.` : 'Aktywność została dodana.', ids });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const overlaps = await assertNoOverlap(connection, req.user.id, req.body);
    if (overlaps.length && req.query.allowOverlap !== 'true') {
      await connection.rollback();
      return res.status(409).json({ message: `Termin nachodzi na: ${overlaps[0].title}.`, overlaps });
    }
    const count = req.body.repeatWeekly ? req.body.repeatCount : 1; const ids = [];
    for (let i = 0; i < count; i += 1) {
      const date = addDays(req.body.activityDate, i * 7);
      const [result] = await connection.execute(`INSERT INTO activities
        (user_id, activity_type, title, activity_date, start_time, end_time, location_lat, location_lng, location_address, postal_code, note, search_radius_km)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.user.id, req.body.activityType, req.body.title, date, req.body.startTime, req.body.endTime, req.body.locationLat ?? null, req.body.locationLng ?? null, req.body.locationAddress, req.body.postalCode, req.body.note, req.body.searchRadiusKm]);
      await insertDetails(connection, result.insertId, req.body); ids.push(result.insertId);
    }
    await connection.commit();
    res.status(201).json({ message: count > 1 ? `Dodano ${count} powtarzających się aktywności.` : 'Aktywność została dodana.', ids });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

async function update(req, res) {
  if (demoMode) {
    const overlap = demoStore.listActivities().find((item) => String(item.id) !== String(req.params.id) && item.activityDate === req.body.activityDate && item.startTime < req.body.endTime && item.endTime > req.body.startTime);
    if (overlap && req.query.allowOverlap !== 'true') return res.status(409).json({ message:`Termin nachodzi na: ${overlap.title}.`, overlaps:[overlap] });
    return demoStore.updateActivity(req.params.id, req.body) ? res.json({ message:'Zmiany zostały zapisane.' }) : res.status(404).json({ message:'Nie znaleziono aktywności.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [owned] = await connection.execute('SELECT id FROM activities WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!owned.length) { await connection.rollback(); return res.status(404).json({ message: 'Nie znaleziono aktywności.' }); }
    const overlaps = await assertNoOverlap(connection, req.user.id, req.body, req.params.id);
    if (overlaps.length && req.query.allowOverlap !== 'true') { await connection.rollback(); return res.status(409).json({ message: `Termin nachodzi na: ${overlaps[0].title}.`, overlaps }); }
    await connection.execute(`UPDATE activities SET activity_type=?, title=?, activity_date=?, start_time=?, end_time=?,
      location_lat=?, location_lng=?, location_address=?, postal_code=?, note=?, search_radius_km=? WHERE id=? AND user_id=?`,
    [req.body.activityType, req.body.title, req.body.activityDate, req.body.startTime, req.body.endTime, req.body.locationLat ?? null, req.body.locationLng ?? null, req.body.locationAddress, req.body.postalCode, req.body.note, req.body.searchRadiusKm, req.params.id, req.user.id]);
    await connection.execute('DELETE FROM basketball_details WHERE activity_id=?', [req.params.id]);
    await connection.execute('DELETE FROM running_details WHERE activity_id=?', [req.params.id]);
    await connection.execute('DELETE FROM swimming_details WHERE activity_id=?', [req.params.id]);
    await insertDetails(connection, req.params.id, req.body);
    await connection.commit(); res.json({ message: 'Zmiany zostały zapisane.' });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

async function remove(req, res) {
  if (demoMode) return demoStore.removeActivity(req.params.id) ? res.status(204).end() : res.status(404).json({ message:'Nie znaleziono aktywności.' });
  const [result] = await pool.execute('DELETE FROM activities WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Nie znaleziono aktywności.' });
  res.status(204).end();
}

async function updateStatus(req, res) {
  if (demoMode) return demoStore.updateStatus(req.params.id, req.body.status)
    ? res.json({ message:req.body.status === 'completed' ? 'Trening został oznaczony jako wykonany.' : 'Trening nie został zaliczony.', status:req.body.status })
    : res.status(404).json({ message:'Nie znaleziono aktywności.' });
  const [result] = await pool.execute(
    'UPDATE activities SET status=? WHERE id=? AND user_id=?',
    [req.body.status, req.params.id, req.user.id],
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Nie znaleziono aktywności.' });
  res.json({ message:req.body.status === 'completed' ? 'Trening został oznaczony jako wykonany.' : 'Trening nie został zaliczony.', status:req.body.status });
}

module.exports = { list, getOne, create, update, updateStatus, remove, mapActivity, SELECT_ACTIVITY };
