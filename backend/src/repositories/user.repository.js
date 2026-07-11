const prisma = require("../config/prisma");

const userInclude = { role: true, operatorProvider: true };

const findByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { ...userInclude, fieldOfficer: { include: { area: true } } }
  });
};

const findById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: { ...userInclude, fieldOfficer: { include: { area: true } } }
  });
};

const listOperators = () => {
  return prisma.user.findMany({
    where: { role: { name: { in: ["Operator", "Management"] } }, isActive: true },
    include: userInclude,
    orderBy: { name: "asc" }
  });
};

const listFieldOfficers = ({ areaId, providerId, region } = {}) => {
  return prisma.user.findMany({
    where: {
      role: { name: "Field Officer" },
      isActive: true,
      fieldOfficer: {
        is: {
          ...(areaId ? { areaId } : {}),
          ...(providerId ? { providerId } : {}),
          ...(region ? { area: { is: { region } } } : {})
        }
      }
    },
    include: {
      role: true,
      fieldOfficer: { include: { area: true, provider: true } }
    },
    orderBy: { name: "asc" }
  });
};

module.exports = { findByEmail, findById, listOperators, listFieldOfficers };
