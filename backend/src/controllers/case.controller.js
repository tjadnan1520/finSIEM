const caseService = require("../services/case.service");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");

const listCases = async (req, res, next) => {
  try {
    const cases = await caseService.listCases(req.user);
    success(res, cases, "Cases loaded");
  } catch (error) {
    next(error);
  }
};

const getCaseDetails = async (req, res, next) => {
  try {
    const caseRecord = await caseService.getCaseDetails(req.params.id, req.user);
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
    const officers = await caseService.listFieldOfficers({
      caseId: req.query.caseId || null,
      areaId: req.query.areaId || null,
      providerId: req.query.providerId || null,
      region: req.query.region || null,
      user: req.user
    });
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

const resolveCase = async (req, res, next) => {
  try {
    const caseRecord = await caseService.resolveCase({
      caseId: req.params.id,
      userId: req.user.id
    });
    success(res, caseRecord, "Case resolved");
  } catch (error) {
    next(error);
  }
};

module.exports = { listCases, getCaseDetails, listFieldOfficers, resolveCase, transferCase };
