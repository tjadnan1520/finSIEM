const prisma = require("../config/prisma");

const userInclude = { role: true };

const findByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: userInclude
  });
};

const findById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: userInclude
  });
};

const listOperators = () => {
  return prisma.user.findMany({
    where: { role: { name: { in: ["Operator", "Management"] } }, isActive: true },
    include: userInclude,
    orderBy: { name: "asc" }
  });
};

const listFieldOfficers = () => {
  return prisma.user.findMany({
    where: {
      role: { name: { in: ["Field Officer", "Agent"] } },
      isActive: true,
      agent: { isNot: null }
    },
    include: {
      role: true,
      agent: { include: { area: true } }
    },
    orderBy: { name: "asc" }
  });
};

module.exports = { findByEmail, findById, listOperators, listFieldOfficers };
