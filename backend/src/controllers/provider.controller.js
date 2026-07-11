const providerService = require("../services/provider.service");
const { success } = require("../utils/apiResponse");

const listProviders = async (req, res, next) => {
  try {
    const providers = await providerService.listProviders();
    success(res, providers, "Providers loaded");
  } catch (error) {
    next(error);
  }
};

module.exports = { listProviders };
