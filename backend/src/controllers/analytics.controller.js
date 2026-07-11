const analyticsService = require("../services/analytics.service");
const { success } = require("../utils/apiResponse");

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getAnalytics();
    success(res, analytics, "Analytics loaded");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
