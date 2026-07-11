const prisma = require("../config/prisma");

const listAgents = () => {
  return prisma.agent.findMany({
    where: { code: { not: { startsWith: "REMOVED-" } } },
    include: {
      area: true,
      physicalCash: true
    },
    orderBy: { name: "asc" }
  });
};

const findAgent = (agentId) => {
  return prisma.agent.findUnique({
    where: { id: agentId },
    include: { area: true, physicalCash: true }
  });
};

const createAgent = ({ name, code, phone, areaId }) => {
  return prisma.agent.create({
    data: { name, code, phone, areaId },
    include: { area: true, physicalCash: true }
  });
};

const removeAgent = (id) => {
  return prisma.agent.update({
    where: { id },
    data: {
      code: `REMOVED-${Date.now()}-${id}`,
      userId: null
    }
  });
};

module.exports = { listAgents, findAgent, createAgent, removeAgent };
