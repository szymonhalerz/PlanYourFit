const { demoMode } = require('../config');

function requireAuth(req, res, next) {
  // Tryb pokazowy: zawsze wpuszczamy na jednego, stałego użytkownika.
  // Bez JWT, bez hashowania, bez wymogu bazy i bez wymogu cookie.
  if (demoMode) {
    req.user = { id: 1, email: 'demo@planyourfit.pl' };
    return next();
  }

  // Minimalna sesja dla trybu SQL, jeśli ktoś świadomie ustawi DEMO_MODE=false.
  if (req.cookies?.demo_session !== '1') {
    return res.status(401).json({ message: 'Zaloguj się na konto pokazowe.' });
  }
  req.user = { id: 1, email: 'demo@planyourfit.pl' };
  next();
}

module.exports = requireAuth;
