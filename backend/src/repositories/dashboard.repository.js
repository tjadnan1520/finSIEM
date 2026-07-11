const prisma = require("../config/prisma");

const getRoleFilters = (user) => {
  if (user?.role === "Operator") {
    return {
      alerts: { severity: "HIGH" },
      cases: { priority: "HIGH" }
    };
  }

  if (user?.role === "Management") {
    return {
      alerts: { severity: "CRITICAL" },
      cases: { priority: "CRITICAL" }
    };
  }

  if (user?.role === "Field Officer" || user?.role === "Agent") {
    return {
      alerts: {
        case: {
          assignments: {
            some: { assignedToId: user.id }
          }
        }
      },
      cases: {
        assignments: {
          some: { assignedToId: user.id }
        }
      }
    };
  }

  return {
    alerts: {},
    cases: {}
  };
};

const getDashboardData = async ({ includeCases = false, user = null } = {}) => {
  const roleFilters = getRoleFilters(user);
  const [
    providers,
    physicalCash,
    recentTransactions,
    recentAlerts,
    openCases
  ] = await Promise.all([
    prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        balances: {
          select: {
            balance: true,
            minimumTarget: true,
            feedStatus: true,
            lastSyncedAt: true
          },
          orderBy: { lastSyncedAt: "desc" },
          take: 1
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.physicalCash.findMany({
      select: {
        balance: true
      }
    }),
    prisma.transaction.findMany({
      select: {
        id: true,
        reference: true,
        type: true,
        amount: true,
        transactionPhone: true,
        status: true,
        createdAt: true,
        provider: { select: { name: true } },
        agent: { select: { name: true, phone: true } },
        area: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.alert.findMany({
      where: roleFilters.alerts,
      select: {
        id: true,
        title: true,
        type: true,
        severity: true,
        status: true,
        createdAt: true,
        provider: { select: { name: true } },
        aiAnalysis: {
          select: {
            summary: true,
            reasoning: true,
            evidenceExplanation: true,
            recommendation: true,
            confidence: true,
            uncertainty: true,
            limitations: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    includeCases
      ? prisma.case.findMany({
          where: roleFilters.cases,
          select: {
            id: true,
            caseNumber: true,
            title: true,
            status: true,
            priority: true,
            alert: { select: { provider: { select: { name: true } } } },
            assignments: {
              select: { assignedTo: { select: { name: true } } },
              orderBy: { assignedAt: "desc" },
              take: 1
            }
          },
          orderBy: { createdAt: "desc" },
          take: 5
        })
      : Promise.resolve([])
  ]);

  return { providers, physicalCash, recentTransactions, recentAlerts, openCases };
};

module.exports = { getDashboardData };
