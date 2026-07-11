const prisma = require("../config/prisma");

const getDashboardData = async () => {
  const [
    providers,
    physicalCash,
    recentTransactions,
    recentAlerts,
    openCases,
    analytics,
    latestAnalysis,
    latestSnapshot
  ] = await Promise.all([
    prisma.provider.findMany({
      include: { balances: { orderBy: { lastSyncedAt: "desc" }, take: 1 } },
      orderBy: { name: "asc" }
    }),
    prisma.physicalCash.findMany({ include: { agent: true, area: true } }),
    prisma.transaction.findMany({
      include: { provider: true, agent: true, area: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.alert.findMany({
      include: { provider: true, aiAnalysis: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.case.findMany({
      include: {
        alert: { include: { provider: true } },
        assignments: { include: { assignedTo: { include: { role: true } } }, take: 1 }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.analytics.findMany({ orderBy: { recordedAt: "desc" }, take: 24 }),
    prisma.aIAnalysis.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.liquiditySnapshot.findFirst({
      include: { forecasts: true },
      orderBy: { observedAt: "desc" }
    })
  ]);

  return { providers, physicalCash, recentTransactions, recentAlerts, openCases, analytics, latestAnalysis, latestSnapshot };
};

module.exports = { getDashboardData };
