const agentService = require("../services/agent.service");
const { success } = require("../utils/apiResponse");

const listAgents = async (req, res, next) => {
  try {
    const agents = await agentService.listAgents(req.user.role);
    success(res, agents, "Agents loaded");
  } catch (error) {
    next(error);
  }
};

module.exports = { listAgents };
