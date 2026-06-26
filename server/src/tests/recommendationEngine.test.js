const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRecommendation } = require('../services/recommendationEngine');

test('zwraca unknown bez danych pogodowych', () => {
  assert.equal(evaluateRecommendation({ activityType: 'running' }).status, 'unknown');
});

test('odradza trening podczas burzy', () => {
  const result = evaluateRecommendation({ activityType: 'running', weather: { temperature: 20, windSpeed: 10, precipitation: 1, thunderstorm: true } });
  assert.equal(result.status, 'bad');
  assert.match(result.reasons.join(' '), /burza/i);
});

test('ostrzega przed upałem', () => {
  const result = evaluateRecommendation({ activityType: 'basketball', courtType: 'outdoor', weather: { temperature: 27, windSpeed: 8, precipitation: 0, thunderstorm: false } });
  assert.equal(result.status, 'warning');
});

test('dobre warunki dają status good', () => {
  const result = evaluateRecommendation({ activityType: 'running', weather: { temperature: 18, windSpeed: 8, precipitation: 0, thunderstorm: false } });
  assert.equal(result.status, 'good');
});
