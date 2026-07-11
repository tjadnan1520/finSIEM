const prisma = require("../config/prisma");

const listAlerts = async () => {
  const alerts = await prisma.alert.findMany({
    include: { provider: true, aiAnalysis: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    provider: alert.provider?.name || "All Providers",
    summary: alert.aiAnalysis?.summary || "",
    createdAt: alert.createdAt
  }));
};

const getAlertDetails = async (id) => {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      provider: true,
      aiAnalysis: true,
      evidence: true,
      case: { include: { timeline: true, assignments: { include: { assignedTo: true } } } }
    }
  });

  if (!alert) {
    return null;
  }

  return {
    id: alert.id,
    title: alert.title,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    provider: alert.provider?.name || "All Providers",
    aiAnalysis: alert.aiAnalysis,
    evidence: alert.evidence.map((item) => ({
      id: item.id,
      source: item.source,
      label: item.label,
      value: item.value,
      weight: Number(item.weight)
    })),
    case: alert.case,
    createdAt: alert.createdAt
  };
};

module.exports = { listAlerts, getAlertDetails };
