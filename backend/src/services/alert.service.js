const prisma = require("../config/prisma");

const toNumber = (value) => Number(value || 0);

const formatAiAnalysis = (analysis) => analysis ? {
  id: analysis.id,
  summary: analysis.summary,
  reasoning: analysis.reasoning,
  evidenceExplanation: analysis.evidenceExplanation,
  recommendation: analysis.recommendation,
  confidence: toNumber(analysis.confidence),
  uncertainty: analysis.uncertainty,
  limitations: analysis.limitations,
  createdAt: analysis.createdAt
} : null;

const formatEvidence = (evidence = []) => evidence.map((item) => ({
  id: item.id,
  source: item.source,
  label: item.label,
  value: item.value,
  weight: toNumber(item.weight)
}));

const formatCase = (caseRecord) => caseRecord ? {
  id: caseRecord.id,
  caseNumber: caseRecord.caseNumber,
  title: caseRecord.title,
  status: caseRecord.status,
  priority: caseRecord.priority,
  createdAt: caseRecord.createdAt,
  timeline: caseRecord.timeline?.map((item) => ({
    id: item.id,
    event: item.event,
    description: item.description,
    createdAt: item.createdAt
  })) || [],
  assignments: caseRecord.assignments?.map((assignment) => ({
    id: assignment.id,
    status: assignment.status,
    assignedAt: assignment.assignedAt,
    acceptedAt: assignment.acceptedAt,
    assignedTo: assignment.assignedTo ? {
      id: assignment.assignedTo.id,
      name: assignment.assignedTo.name,
      email: assignment.assignedTo.email
    } : null
  })) || []
} : null;

const getAlertVisibilityWhere = (user) => {
  if (user.role === "Operator") {
    return {
      severity: "HIGH",
      providerId: user.operatorProviderId || "__no_provider_assigned__"
    };
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
    include: {
      provider: true,
      aiAnalysis: true,
      evidence: { orderBy: { createdAt: "asc" } }
    },
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
    aiAnalysis: formatAiAnalysis(alert.aiAnalysis),
    evidence: formatEvidence(alert.evidence),
    createdAt: alert.createdAt
  }));
};

const canViewAlert = (alert, user) => {
  if (!alert) return false;
  if (user.role === "Management") return alert.severity === "CRITICAL";
  if (user.role === "Operator") {
    return alert.severity === "HIGH" && alert.providerId === user.operatorProviderId;
  }
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
      evidence: { orderBy: { createdAt: "asc" } },
      case: {
        include: {
          timeline: { orderBy: { createdAt: "asc" } },
          assignments: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { assignedAt: "desc" }
          }
        }
      }
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
    summary: alert.aiAnalysis?.summary || "",
    aiAnalysis: formatAiAnalysis(alert.aiAnalysis),
    evidence: formatEvidence(alert.evidence),
    case: formatCase(alert.case),
    createdAt: alert.createdAt
  };
};

module.exports = { listAlerts, getAlertDetails };
