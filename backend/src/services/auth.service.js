const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role.name,
  operatorProvider: user.operatorProvider ? {
    id: user.operatorProvider.id,
    name: user.operatorProvider.name,
    code: user.operatorProvider.code
  } : null
});

const signToken = (user) => {
  return jwt.sign(
    { sub: user.id, role: user.role.name, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    token: signToken(user),
    user: sanitizeUser(user)
  };
};

const getCurrentUser = (user) => user;

module.exports = { login, getCurrentUser, sanitizeUser };
