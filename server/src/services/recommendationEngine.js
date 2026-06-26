const STATUS_COPY = {
  good: 'Dobra pora na aktywność — warunki są korzystne.',
  warning: 'Ostrożnie — sprawdź warunki i przygotuj się odpowiednio.',
  bad: 'Niezalecane — warunki mogą zagrażać bezpieczeństwu.',
  unknown: 'Brak danych — nie udało się pobrać pogody.',
};

function evaluateRecommendation({ activityType, weather, selectedPlace, courtType }) {
  if (!weather || weather.available === false) {
    return { status: 'unknown', message: STATUS_COPY.unknown, reasons: ['Brak aktualnej prognozy.'], suggestions: ['Sprawdź pogodę ponownie bliżej terminu.'] };
  }

  const temperature = Number(weather.temperature);
  const wind = Number(weather.windSpeed || 0);
  const precipitation = Number(weather.precipitation || 0);
  const thunderstorm = Boolean(weather.thunderstorm);
  const outdoor = activityType === 'running' || (activityType === 'basketball' && courtType !== 'indoor');
  const reasons = [];
  const suggestions = [];
  let score = 0;

  if (outdoor && thunderstorm) {
    reasons.push('Prognozowana jest burza.');
    suggestions.push('Przenieś trening do obiektu zamkniętego.');
    score = 10;
  }
  if (outdoor && temperature >= 30) {
    reasons.push(`Wysoka temperatura: ${temperature}°C.`);
    suggestions.push('Wybierz chłodniejszą porę lub trening w pomieszczeniu.');
    score = Math.max(score, 8);
  } else if (outdoor && temperature >= 25) {
    reasons.push(`Może być gorąco: ${temperature}°C.`);
    suggestions.push('Zabierz wodę i zaplanuj przerwy.');
    score = Math.max(score, 4);
  }
  if (outdoor && precipitation > 0.2) {
    reasons.push(`Spodziewane opady: ${precipitation} mm.`);
    suggestions.push(activityType === 'basketball' ? 'Mokra nawierzchnia może być śliska.' : 'Załóż odzież odporną na deszcz.');
    score = Math.max(score, precipitation >= 5 ? 7 : 4);
  }
  if (outdoor && wind >= 35) {
    reasons.push(`Silny wiatr: ${wind} km/h.`);
    suggestions.push('Wybierz osłoniętą trasę lub obiekt zamknięty.');
    score = Math.max(score, wind >= 55 ? 8 : 5);
  }
  if ((activityType === 'swimming' || courtType === 'indoor') && !selectedPlace) {
    reasons.push('Nie wybrano obiektu sportowego.');
    suggestions.push('Wybierz obiekt i sprawdź godziny otwarcia.');
    score = Math.max(score, 4);
  }

  const status = score >= 7 ? 'bad' : score >= 3 ? 'warning' : 'good';
  if (!reasons.length) reasons.push('Temperatura, wiatr i opady mieszczą się w komfortowym zakresie.');
  if (!suggestions.length) suggestions.push('Zabierz wodę i pamiętaj o rozgrzewce.');

  return { status, message: STATUS_COPY[status], reasons, suggestions };
}

module.exports = { evaluateRecommendation };
