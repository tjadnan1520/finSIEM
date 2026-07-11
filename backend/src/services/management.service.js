const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const agentService = require("./agent.service");
const providerService = require("./provider.service");
const ApiError = require("../utils/ApiError");

const listOperators = async () => {
  const operators = await prisma.user.findMany({
    where: { role: { name: "Operator" }, isActive: true },
    include: { role: true },
    orderBy: { name: "asc" }
  });

  return operators.map((operator) => ({
    id: operator.id,
    name: operator.name,
    email: operator.email,
    role: operator.role.name
  }));
};

const listAreas = async () => {
  return prisma.area.findMany({
    select: { id: true, name: true, region: true },
    orderBy: { name: "asc" }
  });
};

const getManagementData = async () => {
  const [providers, operators, agents, areas] = await Promise.all([
    providerService.listProviders("Management"),
    listOperators(),
    agentService.listAgents("Management"),
    listAreas()
  ]);

  return { providers, operators, agents, areas };
};

const createOperator = async ({ name, email, password }) => {
  const role = await prisma.role.findUnique({ where: { name: "Operator" } });
  if (!role) {
    throw new ApiError(409, "Operator role is not available");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const operator = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleId: role.id,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
    },
    include: { role: true }
  });

  return {
    id: operator.id,
    name: operator.name,
    email: operator.email,
    role: operator.role.name
  };
};

const removeOperator = (id) => {
  return prisma.user.update({
    where: { id },
    data: { isActive: false }
  });
};

module.exports = { createOperator, getManagementData, removeOperator };
