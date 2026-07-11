const providerService = require("../services/provider.service");
const { success } = require("../utils/apiResponse");

const listProviders = async (req, res, next) => {
  try {
    const providers = await providerService.listProviders(req.user.role);
    success(res, providers, "Providers loaded");
  } catch (error) {
    next(error);
  }
};

const createProvider = async (req, res, next) => {
  try {
    const provider = await providerService.createProvider(req.body);
    success(res, provider, "Provider created", 201);
  } catch (error) {
    next(error);
  }
};

const removeProvider = async (req, res, next) => {
  try {
    await providerService.removeProvider(req.params.id);
    success(res, null, "Provider removed");
  } catch (error) {
    next(error);
  }
};

module.exports = { listProviders, createProvider, removeProvider };
