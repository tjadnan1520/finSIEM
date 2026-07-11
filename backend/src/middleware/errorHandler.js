const env = require("../config/env");

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    details: error.details || undefined,
    stack: env.nodeEnv === "production" ? undefined : error.stack
  });
};

module.exports = { notFound, errorHandler };
