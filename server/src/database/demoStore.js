const iso = (date) => date.toISOString().slice(0, 10);
const relativeDate = (days) => { const date = new Date(); date.setDate(date.getDate() + days); return iso(date); };

const user = {
  id: 1,
  name: 'Demo',
  email: 'demo@planyourfit.pl',
  defaultLocation: 'Warszawa',
  defaultPostalCode: '00-001',
  defaultLocationLat: 52.2297,
  defaultLocationLng: 21.0122,
  preferredRadiusKm: 25,
  monthlyActivityGoal: 8,
  theme: 'light',
};

const activities = [
  { id:101, status:'planned', activityType:'running', title:'Poranny bieg w Parku Saskim', activityDate:relativeDate(1), startTime:'07:30', endTime:'08:15', locationAddress:'Ogród Saski, Warszawa', postalCode:'00-102', locationLat:52.2415, locationLng:21.0084, searchRadiusKm:25, note:'Spokojne tempo, druga strefa.', details:{ targetDistanceKm:7, actualDistanceKm:6.92, paceMinPerKm:6, estimatedDurationMinutes:42 } },
  { id:102, status:'planned', activityType:'basketball', title:'Koszykówka na hali', activityDate:relativeDate(3), startTime:'18:00', endTime:'19:30', locationAddress:'OSiR Polna, ul. Polna 7A, Warszawa', postalCode:'00-625', locationLat:52.2188, locationLng:21.0151, searchRadiusKm:25, note:'Wyszukiwanie hal działa przez Overpass API.', details:{ courtType:'indoor', selectedPlaceId:null } },
  { id:103, status:'planned', activityType:'swimming', title:'Regeneracja na basenie', activityDate:relativeDate(5), startTime:'10:00', endTime:'11:00', locationAddress:'Pływalnia Polna, ul. Polna 7A, Warszawa', postalCode:'00-625', locationLat:52.2188, locationLng:21.0151, searchRadiusKm:25, note:'Baseny są pobierane przez Overpass API.', details:{ selectedPlaceId:null } },
  { id:104, status:'completed', activityType:'running', title:'Luźne 5 km nad Wisłą', activityDate:relativeDate(-2), startTime:'17:00', endTime:'17:35', locationAddress:'Bulwary Wiślane, Warszawa', postalCode:'00-390', locationLat:52.2394, locationLng:21.0313, searchRadiusKm:25, note:'Ukończony trening liczony do statystyk.', details:{ targetDistanceKm:5, actualDistanceKm:5.1, paceMinPerKm:6.5, estimatedDurationMinutes:35 } },
];

let nextId = 1000;
const clone = (value) => structuredClone(value);
const addDays = (value, days) => { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };

function listActivities() { return clone(activities); }
function getActivity(id) { const found = activities.find((item) => String(item.id) === String(id)); return found ? clone(found) : null; }
function createActivities(data) {
  const count = data.repeatWeekly ? Number(data.repeatCount || 1) : 1;
  const ids = [];
  for (let index = 0; index < count; index += 1) {
    const id = nextId++;
    activities.push({ ...clone(data), id, status:'planned', activityDate:addDays(data.activityDate, index * 7) });
    ids.push(id);
  }
  return ids;
}
function updateActivity(id, data) { const index = activities.findIndex((item) => String(item.id) === String(id)); if (index < 0) return false; activities[index] = { ...clone(data), id:activities[index].id, status:activities[index].status || 'planned' }; return true; }
function updateStatus(id, status) { const item = activities.find((entry) => String(entry.id) === String(id)); if (!item) return false; item.status = status; return true; }
function removeActivity(id) { const index = activities.findIndex((item) => String(item.id) === String(id)); if (index < 0) return false; activities.splice(index, 1); return true; }

module.exports = { user, listActivities, getActivity, createActivities, updateActivity, updateStatus, removeActivity };
