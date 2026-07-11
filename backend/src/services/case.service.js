const prisma = require("../config/prisma");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");

const getCaseVisibilityWhere = (user) => {
  if (user.role === "Operator") {
    return { priority: "HIGH" };
  }

  if (user.role === "Field Officer" || user.role === "Agent") {
    return {
      assignments: {
        some: { assignedToId: user.id }
      }
    };
  }

  return {};
};

const listCases = async (user) => {
  const cases = await prisma.case.findMany({
    where: getCaseVisibilityWhere(user),
    include: {
      alert: { include: { provider: true } },
      assignments: { include: { assignedTo: true }, orderBy: { assignedAt: "desc" }, take: 1 }
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

const canViewCase = (caseRecord, user) => {
  if (!caseRecord) return false;
  if (user.role === "Management") return true;
  if (user.role === "Operator") return caseRecord.priority === "HIGH";
  if (user.role === "Field Officer") {
    return caseRecord.assignments.some((assignment) => assignment.assignedToId === user.id);
  }
  return true;
};

const getCaseDetails = async (id, user) => {
  const caseRecord = await prisma.case.findUnique({
    where: { id },
    include: {
      alert: { include: { provider: true, aiAnalysis: true, evidence: true } },
      assignments: { include: { assignedTo: true, assignedBy: true } },
      escalations: true,
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      timeline: { orderBy: { createdAt: "asc" } }
    }
  });

  return canViewCase(caseRecord, user) ? caseRecord : null;
};

const listFieldOfficers = async () => {
  const officers = await userRepository.listFieldOfficers();
  return officers.map((officer) => ({
    id: officer.id,
    name: officer.name,
    email: officer.email,
    area: officer.agent?.area?.name || "Unassigned area",
    agentCode: officer.agent?.code || null
  }));
};

const transferCase = async ({ caseId, assignedToId, assignedById }) => {
  const fieldOfficer = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      isActive: true,
      role: { name: { in: ["Field Officer", "Agent"] } },
      agent: { isNot: null }
    },
    include: { agent: { include: { area: true } } }
  });

  if (!fieldOfficer) {
    throw new ApiError(404, "Field officer was not found");
  }

  return prisma.$transaction(async (tx) => {
    const caseRecord = await tx.case.findUnique({
      where: { id: caseId },
      include: { alert: { include: { provider: true } } }
    });

    if (!caseRecord) {
      throw new ApiError(404, "Case was not found");
    }

    const assignment = await tx.assignment.create({
      data: {
        caseId,
        assignedToId,
        assignedById,
        status: "TRANSFERRED"
      },
      include: { assignedTo: true, assignedBy: true }
    });

    await tx.case.update({
      where: { id: caseId },
      data: { status: "ASSIGNED" }
    });

    await tx.timeline.create({
      data: {
        caseId,
        event: "Transfer",
        description: `Sent to ${fieldOfficer.name} for follow-up.`
      }
    });

    await tx.notification.create({
      data: {
        userId: assignedToId,
        title: "Case transferred",
        body: `${caseRecord.caseNumber} is ready for review.`
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: assignedById,
        action: "CASE_TRANSFERRED",
        resource: "Case",
        newValue: { caseId, assignedToId }
      }
    });

    return assignment;
  });
};

module.exports = { listCases, getCaseDetails, listFieldOfficers, transferCase };
