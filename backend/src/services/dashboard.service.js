const dashboardRepository = require("../repositories/dashboard.repository");

const toNumber = (value) => Number(value || 0);
const cacheTtlMs = 30000;
const dashboardCache = new Map();

const providerOrder = ["bKash", "Nagad", "Rocket"];

const buildSummaryCards = ({ providers, physicalCash }) => {
  const totalPhysicalCash = physicalCash.reduce((sum, cash) => sum + toNumber(cash.balance), 0);
  const providerCards = providerOrder.map((name) => {
    const provider = providers.find((item) => item.name.toLowerCase() === name.toLowerCase());

    return {
      label: name,
      value: toNumber(provider?.balances[0]?.balance),
      format: "currency",
      tone: provider?.balances[0]?.feedStatus === "DELAYED" ? "warning" : "info"
    };
  });

  return [
    { label: "Physical Cash", value: totalPhysicalCash, format: "currency", tone: "success" },
    ...providerCards
  ];
};

const loadDashboard = async (role) => {
  const raw = await dashboardRepository.getDashboardData({ includeCases: role !== "Agent" });

  const recentTransactions = raw.recentTransactions.map((transaction) => ({
    id: transaction.id,
    reference: transaction.reference,
    type: transaction.type,
    amount: toNumber(transaction.amount),
    provider: transaction.provider.name,
    agent: transaction.agent.name,
    agentPhone: transaction.agent.phone,
    area: transaction.area.name,
    status: transaction.status,
    createdAt: transaction.createdAt
  }));

  const recentAlerts = raw.recentAlerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    provider: alert.provider?.name || "All Providers",
    summary: alert.aiAnalysis?.summary || "",
    createdAt: alert.createdAt
  }));

  const cases = raw.openCases.map((caseRecord) => ({
    id: caseRecord.id,
    caseNumber: caseRecord.caseNumber,
    title: caseRecord.title,
    status: caseRecord.status,
    priority: caseRecord.priority,
    provider: caseRecord.alert.provider?.name || "All Providers",
    assignedTo: caseRecord.assignments[0]?.assignedTo.name || "Unassigned"
  }));
  const latestAnalysis = raw.recentAlerts.find((alert) => alert.aiAnalysis)?.aiAnalysis;

  return {
    role,
    summaryCards: buildSummaryCards(raw),
    recentTransactions,
    recentAlerts,
    cases,
    aiRecommendation: latestAnalysis ? {
      summary: latestAnalysis.summary,
      reasoning: latestAnalysis.reasoning,
      evidenceExplanation: latestAnalysis.evidenceExplanation,
      recommendation: latestAnalysis.recommendation,
      confidence: toNumber(latestAnalysis.confidence),
      uncertainty: latestAnalysis.uncertainty,
      limitations: latestAnalysis.limitations
    } : null
  };
};

const getDashboard = async (role) => {
  const cached = dashboardCache.get(role);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await loadDashboard(role);
  dashboardCache.set(role, {
    data,
    expiresAt: Date.now() + cacheTtlMs
  });
  return data;
};

const invalidateDashboardCache = () => {
  dashboardCache.clear();
};

const warmDashboardCache = async () => {
  await Promise.allSettled(["Agent", "Operator", "Management"].map((role) => getDashboard(role)));
};

module.exports = { getDashboard, invalidateDashboardCache, warmDashboardCache };
