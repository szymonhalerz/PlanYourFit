const pool = require('../database/pool');
const demoStore = require('../database/demoStore');
const { demoMode } = require('../config');

async function stats(req, res) {
  const period = req.params.period === 'month' ? 'month' : 'week';
  if (demoMode) {
    const now=new Date(), start=new Date(now);
    if (period === 'month') start.setDate(1); else start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0,0,0,0); const end=new Date(start); period === 'month' ? end.setMonth(start.getMonth()+1) : end.setDate(start.getDate()+7);
    const items=demoStore.listActivities().filter((item)=>item.status==='completed'&&new Date(`${item.activityDate}T12:00:00`)>=start&&new Date(`${item.activityDate}T12:00:00`)<end);
    const totalMinutes=items.reduce((sum,item)=>{const [sh,sm]=item.startTime.split(':').map(Number),[eh,em]=item.endTime.split(':').map(Number);return sum+eh*60+em-sh*60-sm;},0);
    const runningDistanceKm=items.filter((item)=>item.activityType==='running').reduce((sum,item)=>sum+Number(item.details?.actualDistanceKm||item.details?.targetDistanceKm||0),0);
    const byType=Object.keys(items.reduce((types,item)=>({...types,[item.activityType]:true}),{})).map((type)=>({type,count:items.filter((item)=>item.activityType===type).length}));
    return res.json({ period, activityCount:items.length, totalMinutes, runningDistanceKm, byType });
  }
  const startExpression = period === 'month'
    ? 'DATE_FORMAT(CURRENT_DATE, \'%Y-%m-01\')'
    : 'DATE_SUB(CURRENT_DATE, INTERVAL WEEKDAY(CURRENT_DATE) DAY)';
  const endExpression = period === 'month'
    ? 'LAST_DAY(CURRENT_DATE)'
    : 'DATE_ADD(DATE_SUB(CURRENT_DATE, INTERVAL WEEKDAY(CURRENT_DATE) DAY), INTERVAL 6 DAY)';
  const [summary] = await pool.execute(`SELECT COUNT(*) AS activityCount,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) AS totalMinutes,
    COALESCE(SUM(rd.actual_distance_km), 0) AS runningDistanceKm
    FROM activities a LEFT JOIN running_details rd ON rd.activity_id=a.id
    WHERE a.user_id=? AND a.status='completed' AND a.activity_date BETWEEN ${startExpression} AND ${endExpression}`, [req.user.id]);
  const [byType] = await pool.execute(`SELECT activity_type AS type, COUNT(*) AS count FROM activities
    WHERE user_id=? AND status='completed' AND activity_date BETWEEN ${startExpression} AND ${endExpression}
    GROUP BY activity_type`, [req.user.id]);
  res.json({ period, ...summary[0], byType });
}

module.exports = { stats };
