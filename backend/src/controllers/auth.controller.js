const authService = require("../services/auth.service");
const { success } = require("../utils/apiResponse");

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    success(res, data, "Login successful");
  } catch (error) {
    next(error);
  }
};

const me = (req, res) => {
  success(res, authService.getCurrentUser(req.user), "Authenticated user loaded");
};

module.exports = { login, me };
