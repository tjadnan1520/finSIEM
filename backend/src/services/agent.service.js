const agentRepository = require("../repositories/agent.repository");

const listAgents = async (role) => {
  const agents = await agentRepository.listAgents();
  return agents.map((agent) => ({
    id: agent.id,
    code: agent.code,
    name: agent.name,
    phone: agent.phone,
    area: agent.area.name,
    areaId: agent.areaId,
    ...(role === "Operator" || role === "Management" ? {} : {
      physicalCash: agent.physicalCash ? Number(agent.physicalCash.balance) : 0,
      minimumTarget: agent.physicalCash ? Number(agent.physicalCash.minimumTarget) : 0
    })
  }));
};

const createAgent = async (payload) => {
  const agent = await agentRepository.createAgent(payload);
  return {
    id: agent.id,
    code: agent.code,
    name: agent.name,
    phone: agent.phone,
    area: agent.area.name,
    areaId: agent.areaId
  };
};

const removeAgent = (id) => agentRepository.removeAgent(id);

module.exports = { listAgents, createAgent, removeAgent };
