const prisma = require("../config/prisma");

const listProviders = () => {
  return prisma.provider.findMany({
    where: { status: { not: "REMOVED" } },
    include: {
      balances: {
        orderBy: { lastSyncedAt: "desc" },
        take: 1
      }
    },
    orderBy: { name: "asc" }
  });
};

const findProvider = (providerId) => {
  return prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      balances: { orderBy: { lastSyncedAt: "desc" }, take: 1 }
    }
  });
};

const createProvider = ({ name, code, status = "ACTIVE" }) => {
  return prisma.provider.create({
    data: {
      name,
      code,
      status,
      balances: {
        create: {
          balance: 0,
          minimumTarget: 0,
          feedStatus: "CURRENT"
        }
      }
    },
    include: {
      balances: {
        orderBy: { lastSyncedAt: "desc" },
        take: 1
      }
    }
  });
};

const removeProvider = (id) => {
  return prisma.provider.update({
    where: { id },
    data: { status: "REMOVED" }
  });
};

module.exports = { listProviders, findProvider, createProvider, removeProvider };
