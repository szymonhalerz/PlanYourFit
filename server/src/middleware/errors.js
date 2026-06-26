function notFound(req, res) {
  res.status(404).json({ message: 'Nie znaleziono zasobu.' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error(err);
  const status = err.status || (err.name === 'ZodError' ? 400 : 500);
  const details = err.name === 'ZodError'
    ? err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    : undefined;
  res.status(status).json({
    message: status === 500 ? 'Wystąpił nieoczekiwany błąd serwera.' : err.message,
    ...(details && { details }),
  });
}

module.exports = { notFound, errorHandler };
