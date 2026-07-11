const caseService = require("../services/case.service");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");

const listCases = async (req, res, next) => {
  try {
    const cases = await caseService.listCases();
    success(res, cases, "Cases loaded");
  } catch (error) {
    next(error);
  }
};

const getCaseDetails = async (req, res, next) => {
  try {
    const caseRecord = await caseService.getCaseDetails(req.params.id);
    if (!caseRecord) {
      throw new ApiError(404, "Case was not found");
    }
    success(res, caseRecord, "Case details loaded");
  } catch (error) {
    next(error);
  }
};

const listFieldOfficers = async (req, res, next) => {
  try {
    const officers = await caseService.listFieldOfficers();
    success(res, officers, "Field officers loaded");
  } catch (error) {
    next(error);
  }
};

const transferCase = async (req, res, next) => {
  try {
    const assignment = await caseService.transferCase({
      caseId: req.params.id,
      assignedToId: req.body.assignedToId,
      assignedById: req.user.id
    });
    success(res, assignment, "Case transferred");
  } catch (error) {
    next(error);
  }
};

module.exports = { listCases, getCaseDetails, listFieldOfficers, transferCase };
