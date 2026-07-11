const prisma = require("../config/prisma");

const listProviders = () => {
  return prisma.provider.findMany({
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

module.exports = { listProviders, findProvider };
