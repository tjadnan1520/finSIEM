const agentService = require("../services/agent.service");
const { success } = require("../utils/apiResponse");

const listAgents = async (req, res, next) => {
  try {
    const agents = await agentService.listAgents();
    success(res, agents, "Agents loaded");
  } catch (error) {
    next(error);
  }
};

module.exports = { listAgents };
