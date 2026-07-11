const prisma = require("../config/prisma");

const listCases = async () => {
  const cases = await prisma.case.findMany({
    include: {
      alert: { include: { provider: true } },
      assignments: { include: { assignedTo: true }, take: 1 }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return cases.map((caseRecord) => ({
    id: caseRecord.id,
    caseNumber: caseRecord.caseNumber,
    title: caseRecord.title,
    status: caseRecord.status,
    priority: caseRecord.priority,
    provider: caseRecord.alert.provider?.name || "All Providers",
    assignedTo: caseRecord.assignments[0]?.assignedTo.name || "Unassigned",
    createdAt: caseRecord.createdAt
  }));
};

const getCaseDetails = (id) => {
  return prisma.case.findUnique({
    where: { id },
    include: {
      alert: { include: { provider: true, aiAnalysis: true, evidence: true } },
      assignments: { include: { assignedTo: true, assignedBy: true } },
      escalations: true,
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      timeline: { orderBy: { createdAt: "asc" } }
    }
  });
};

module.exports = { listCases, getCaseDetails };
