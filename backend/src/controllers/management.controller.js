const managementService = require("../services/management.service");
const { success } = require("../utils/apiResponse");

const getManagementData = async (req, res, next) => {
  try {
    const data = await managementService.getManagementData();
    success(res, data, "Management data loaded");
  } catch (error) {
    next(error);
  }
};

const createOperator = async (req, res, next) => {
  try {
    const operator = await managementService.createOperator(req.body);
    success(res, operator, "Operator created", 201);
  } catch (error) {
    next(error);
  }
};

const removeOperator = async (req, res, next) => {
  try {
    await managementService.removeOperator(req.params.id);
    success(res, null, "Operator removed");
  } catch (error) {
    next(error);
  }
};

module.exports = { createOperator, getManagementData, removeOperator };
