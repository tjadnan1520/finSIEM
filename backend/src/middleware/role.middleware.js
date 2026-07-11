const ApiError = require("../utils/ApiError");

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "You are not authorized to access this resource");
  }

  next();
};

module.exports = authorizeRoles;
