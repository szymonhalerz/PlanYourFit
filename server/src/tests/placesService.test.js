const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOverpassQuery, mapElements } = require('../services/placesService');

test('zapytanie basenów używa promienia i tagów OpenStreetMap', () => {
  const query = buildOverpassQuery({ type:'pool', lat:52.23, lng:21.01, radiusKm:8 });
  assert.match(query, /around:8000,52\.23,21\.01/);
  assert.match(query, /swimming_pool/);
  assert.match(query, /out body center 100/);
});

test('zapytanie hal obejmuje hale sportowe i koszykówkę pod dachem', () => {
  const query = buildOverpassQuery({ type:'hall', lat:52.23, lng:21.01, radiusKm:5 });
  assert.match(query, /sports_hall/);
  assert.match(query, /basketball/);
});

test('wyniki są sortowane po odległości i ograniczone do trzech', () => {
  const elements = [
    { type:'node', id:1, lat:52.25, lon:21.01, tags:{ name:'Daleko' } },
    { type:'node', id:2, lat:52.231, lon:21.01, tags:{ name:'Najbliżej', 'addr:street':'Prosta', 'addr:housenumber':'1' } },
    { type:'node', id:3, lat:52.24, lon:21.01, tags:{ name:'Środek' } },
    { type:'node', id:4, lat:52.245, lon:21.01, tags:{ name:'Czwarte' } },
  ];
  const places = mapElements(elements, { type:'pool', lat:52.23, lng:21.01, radiusKm:10 });
  assert.equal(places.length, 3);
  assert.equal(places[0].name, 'Najbliżej');
  assert.equal(places[0].address, 'Prosta 1');
  assert.ok(places[0].distanceKm <= places[1].distanceKm);
});
