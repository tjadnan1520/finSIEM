const alertService = require("../services/alert.service");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");

const listAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.listAlerts();
    success(res, alerts, "Alerts loaded");
  } catch (error) {
    next(error);
  }
};

const getAlertDetails = async (req, res, next) => {
  try {
    const alert = await alertService.getAlertDetails(req.params.id);
    if (!alert) {
      throw new ApiError(404, "Alert was not found");
    }
    success(res, alert, "Alert details loaded");
  } catch (error) {
    next(error);
  }
};

module.exports = { listAlerts, getAlertDetails };
