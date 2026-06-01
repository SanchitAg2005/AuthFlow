const AppError = require('../errors/AppError');

module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    const errorDetails = result.error.errors.map(err => ({
      field: err.path.join('.').replace(/^(body|params|query)\./, ''),
      message: err.message
    }));
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errorDetails));
  }

  // Inject parsed, sanitized, and type-cast values back into Express req
  req.body = result.data.body || req.body;
  req.params = result.data.params || req.params;
  req.query = result.data.query || req.query;
  next();
};
