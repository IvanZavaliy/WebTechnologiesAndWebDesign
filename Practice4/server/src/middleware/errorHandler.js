const { ZodError } = require('zod');

/**
 * Centralized error handler middleware.
 * Catches all errors and returns a unified API error format.
 */
function errorHandler(err, req, res, _next) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Known application errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this value already exists',
      details: err.meta,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
    });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
  });
}

module.exports = errorHandler;
