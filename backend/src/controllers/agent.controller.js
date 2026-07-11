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

const createAgent = async (req, res, next) => {
  try {
    const agent = await agentService.createAgent(req.body);
    success(res, agent, "Agent created", 201);
  } catch (error) {
    next(error);
  }
};

const removeAgent = async (req, res, next) => {
  try {
    await agentService.removeAgent(req.params.id);
    success(res, null, "Agent removed");
  } catch (error) {
    next(error);
  }
};

module.exports = { listAgents, createAgent, removeAgent };
