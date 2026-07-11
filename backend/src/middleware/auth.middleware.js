const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");

const authUserCache = new Map();
const authUserCacheTtlMs = 60000;

const getCachedUser = async (userId) => {
  const cached = authUserCache.get(userId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  const user = await userRepository.findById(userId);
  if (user) {
    authUserCache.set(userId, {
      user,
      expiresAt: Date.now() + authUserCacheTtlMs
    });
  }

  return user;
};

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await getCachedUser(payload.sub);

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
