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

const buildOperatorSummaryCards = ({ recentTransactions, recentAlerts, openCases }) => [
  { label: "Open Cases", value: openCases.filter((caseRecord) => caseRecord.status !== "RESOLVED" && caseRecord.status !== "CLOSED").length, format: "number", tone: "warning" },
  { label: "Recent Alerts", value: recentAlerts.length, format: "number", tone: "danger" },
  { label: "Recent Transactions", value: recentTransactions.length, format: "number", tone: "info" }
];

const buildManagementSummaryCards = ({ recentTransactions, recentAlerts, openCases }) => [
  { label: "Critical Cases", value: openCases.filter((caseRecord) => caseRecord.priority === "CRITICAL").length, format: "number", tone: "danger" },
  { label: "Critical Alerts", value: recentAlerts.length, format: "number", tone: "danger" },
  { label: "Recent Transactions", value: recentTransactions.length, format: "number", tone: "info" }
];

const buildFieldOfficerSummaryCards = ({ recentAlerts, openCases }) => [
  { label: "Assigned Cases", value: openCases.length, format: "number", tone: "info" },
  { label: "Open Work", value: openCases.filter((caseRecord) => caseRecord.status !== "RESOLVED" && caseRecord.status !== "CLOSED").length, format: "number", tone: "warning" },
  { label: "Related Alerts", value: recentAlerts.length, format: "number", tone: "danger" }
];

const loadDashboard = async (user) => {
  const role = user.role;
  const raw = await dashboardRepository.getDashboardData({ includeCases: true, user });

  const recentTransactions = raw.recentTransactions.map((transaction) => ({
    id: transaction.id,
    reference: transaction.reference,
    type: transaction.type,
    amount: toNumber(transaction.amount),
    transactionPhone: transaction.transactionPhone,
    provider: transaction.provider.name,
    agent: transaction.agent.name,
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
    agent: caseRecord.agent ? {
      id: caseRecord.agent.id,
      name: caseRecord.agent.name,
      phone: caseRecord.agent.phone,
      area: caseRecord.agent.area.name
    } : null,
    assignedTo: caseRecord.assignments[0]?.assignedTo.name || "Unassigned"
  }));
  const latestAnalysis = role === "Operator" || role === "Management" ? null : raw.recentAlerts.find((alert) => alert.aiAnalysis)?.aiAnalysis;
  const summaryCards = role === "Operator"
    ? buildOperatorSummaryCards(raw)
    : role === "Management"
      ? buildManagementSummaryCards(raw)
      : role === "Field Officer" || role === "Agent"
        ? buildFieldOfficerSummaryCards(raw)
        : buildSummaryCards(raw);

  return {
    role,
    summaryCards,
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

const getDashboard = async (user) => {
  const cacheKey = `${user.role}:${user.id}`;
  const cached = dashboardCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await loadDashboard(user);
  dashboardCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + cacheTtlMs
  });
  return data;
};

const invalidateDashboardCache = () => {
  dashboardCache.clear();
};

const warmDashboardCache = async () => {
  dashboardCache.clear();
};

module.exports = { getDashboard, invalidateDashboardCache, warmDashboardCache };
