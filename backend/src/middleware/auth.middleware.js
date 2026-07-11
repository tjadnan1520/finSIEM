const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await userRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new ApiError(401, "Authenticated user is no longer active");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role.name
    };

    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired token"));
  }
};

module.exports = authenticate;
