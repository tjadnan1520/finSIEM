const prisma = require("../config/prisma");

const listAgents = () => {
  return prisma.agent.findMany({
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

module.exports = { listAgents, findAgent };
