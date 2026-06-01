module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.code = err.code || 'INTERNAL_SERVER_ERROR';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
      errors: err.errors,
      stack: err.stack
    });
  } else {
    // Production Mode: Hide sensitive stack traces
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong',
      code: err.code,
      errors: err.errors
    });
  }
};
