const dashboardService = require("../services/dashboard.service");
const { success } = require("../utils/apiResponse");

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.user);
    success(res, dashboard, "Dashboard loaded");
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
