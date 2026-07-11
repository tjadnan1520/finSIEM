const dashboardRepository = require("../repositories/dashboard.repository");

const toNumber = (value) => Number(value || 0);

const buildSummaryCards = ({ providers, physicalCash, recentAlerts, openCases, latestSnapshot }) => {
  const totalProviderBalance = providers.reduce((sum, provider) => sum + toNumber(provider.balances[0]?.balance), 0);
  const totalPhysicalCash = physicalCash.reduce((sum, cash) => sum + toNumber(cash.balance), 0);
  const criticalAlerts = recentAlerts.filter((alert) => alert.severity === "CRITICAL" || alert.severity === "HIGH").length;

  return [
    { label: "Physical Cash", value: totalPhysicalCash, format: "currency", trend: 4.2, tone: "success" },
    { label: "Provider Balances", value: totalProviderBalance, format: "currency", trend: -2.1, tone: "warning" },
    { label: "Liquidity Score", value: toNumber(latestSnapshot?.liquidityScore), format: "score", trend: 1.8, tone: "info" },
    { label: "Active Reviews", value: openCases.length, format: "number", trend: criticalAlerts, tone: criticalAlerts ? "danger" : "success" }
  ];
};

const getDashboard = async (role) => {
  const raw = await dashboardRepository.getDashboardData();
  const providerBalances = raw.providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    code: provider.code,
    status: provider.status,
    balance: toNumber(provider.balances[0]?.balance),
    minimumTarget: toNumber(provider.balances[0]?.minimumTarget),
    feedStatus: provider.balances[0]?.feedStatus || "UNKNOWN"
  }));

  const liquidityOverview = {
    score: toNumber(raw.latestSnapshot?.liquidityScore),
    cashRatio: toNumber(raw.latestSnapshot?.cashRatio),
    providerBalanceRatio: toNumber(raw.latestSnapshot?.providerBalanceRatio),
    timeToShortage: toNumber(raw.latestSnapshot?.timeToShortage),
    forecasts: (raw.latestSnapshot?.forecasts || []).map((forecast) => ({
      horizonMinutes: forecast.horizonMinutes,
      expectedLiquidity: toNumber(forecast.expectedLiquidity),
      expectedDemand: toNumber(forecast.expectedDemand),
      projectedShortage: toNumber(forecast.projectedShortage),
      confidence: toNumber(forecast.confidence)
    }))
  };

  const recentTransactions = raw.recentTransactions.map((transaction) => ({
    id: transaction.id,
    reference: transaction.reference,
    type: transaction.type,
    amount: toNumber(transaction.amount),
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
    assignedTo: caseRecord.assignments[0]?.assignedTo.name || "Unassigned"
  }));

  const analytics = raw.analytics.map((metric) => ({
    id: metric.id,
    metric: metric.metric,
    value: toNumber(metric.value),
    trend: toNumber(metric.trend),
    recordedAt: metric.recordedAt
  }));

  return {
    role,
    summaryCards: buildSummaryCards({ ...raw, openCases: raw.openCases }),
    liquidityOverview,
    providerBalances,
    recentTransactions,
    recentAlerts,
    cases,
    analytics,
    aiRecommendation: raw.latestAnalysis ? {
      summary: raw.latestAnalysis.summary,
      reasoning: raw.latestAnalysis.reasoning,
      evidenceExplanation: raw.latestAnalysis.evidenceExplanation,
      recommendation: raw.latestAnalysis.recommendation,
      confidence: toNumber(raw.latestAnalysis.confidence),
      uncertainty: raw.latestAnalysis.uncertainty,
      limitations: raw.latestAnalysis.limitations
    } : null
  };
};

module.exports = { getDashboard };
