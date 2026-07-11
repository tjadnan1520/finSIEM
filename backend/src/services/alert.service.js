const prisma = require("../config/prisma");

const getAlertVisibilityWhere = (user) => {
  if (user.role === "Operator") {
    return { severity: "HIGH" };
  }

  if (user.role === "Management") {
    return { severity: "CRITICAL" };
  }

  if (user.role === "Field Officer" || user.role === "Agent") {
    return {
      case: {
        assignments: {
          some: { assignedToId: user.id }
        }
      }
    };
  }

  return {};
};

const listAlerts = async (user) => {
  const alerts = await prisma.alert.findMany({
    where: getAlertVisibilityWhere(user),
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

const canViewAlert = (alert, user) => {
  if (!alert) return false;
  if (user.role === "Management") return alert.severity === "CRITICAL";
  if (user.role === "Operator") return alert.severity === "HIGH";
  if (user.role === "Field Officer") {
    return alert.case?.assignments?.some((assignment) => assignment.assignedToId === user.id);
  }
  return true;
};

const getAlertDetails = async (id, user) => {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      provider: true,
      aiAnalysis: true,
      evidence: true,
      case: { include: { timeline: true, assignments: { include: { assignedTo: true } } } }
    }
  });

  if (!canViewAlert(alert, user)) {
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
