class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.errors = errors;
    this.isOperational = true; // Flag to identify handled operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
