const prisma = require("../config/prisma");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");

const getCaseVisibilityWhere = (user) => {
  if (user.role === "Operator") {
    return {
      priority: "HIGH",
      alert: { providerId: user.operatorProviderId || "__no_provider_assigned__" }
    };
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
      agent: { include: { area: true } },
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
    agent: caseRecord.agent ? {
      id: caseRecord.agent.id,
      name: caseRecord.agent.name,
      phone: caseRecord.agent.phone,
      area: caseRecord.agent.area.name,
      region: caseRecord.agent.area.region
    } : null,
    assignedTo: caseRecord.assignments[0]?.assignedTo.name || "Unassigned",
    createdAt: caseRecord.createdAt
  }));
};

const canViewCase = (caseRecord, user) => {
  if (!caseRecord) return false;
  if (user.role === "Management") return true;
  if (user.role === "Operator") {
    return caseRecord.priority === "HIGH" && caseRecord.alert.providerId === user.operatorProviderId;
  }
  if (user.role === "Field Officer" || user.role === "Agent") {
    return caseRecord.assignments.some((assignment) => assignment.assignedToId === user.id);
  }
  return true;
};

const getCaseDetails = async (id, user) => {
  const caseRecord = await prisma.case.findUnique({
    where: { id },
    include: {
      alert: { include: { provider: true, aiAnalysis: true, evidence: true } },
      agent: { include: { area: true } },
      assignments: { include: { assignedTo: true, assignedBy: true } },
      escalations: true,
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      timeline: { orderBy: { createdAt: "asc" } }
    }
  });

  return canViewCase(caseRecord, user) ? caseRecord : null;
};

const listFieldOfficers = async ({ caseId = null, areaId = null, providerId = null, region = null, user = null } = {}) => {
  const caseRecord = caseId
    ? await prisma.case.findUnique({
        where: { id: caseId },
        include: { alert: true, agent: { include: { area: true } } }
      })
    : null;

  if (user?.role === "Operator" && caseRecord && caseRecord.alert.providerId !== user.operatorProviderId) {
    throw new ApiError(403, "You are not authorized to access this resource");
  }

  const effectiveAreaId = caseRecord?.agent?.areaId || areaId;
  const effectiveProviderId = caseRecord?.alert?.providerId || user?.operatorProviderId || providerId;
  const officers = await userRepository.listFieldOfficers({
    areaId: effectiveAreaId,
    providerId: effectiveProviderId,
    region
  });
  return officers
    .map((officer) => ({
      id: officer.id,
      name: officer.name,
      email: officer.email,
      area: officer.fieldOfficer?.area?.name || "Unassigned area",
      areaId: officer.fieldOfficer?.areaId || null,
      region: officer.fieldOfficer?.area?.region || "Unassigned region",
      provider: officer.fieldOfficer?.provider?.name || "Unassigned provider",
      providerId: officer.fieldOfficer?.providerId || null,
      officerCode: officer.fieldOfficer?.code || null,
      phone: officer.fieldOfficer?.phone || null
    }));
};

const transferCase = async ({ caseId, assignedToId, assignedById }) => {
  const fieldOfficer = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      isActive: true,
      role: { name: "Field Officer" },
      fieldOfficer: { isNot: null }
    },
    include: { fieldOfficer: { include: { area: true, provider: true } } }
  });

  if (!fieldOfficer) {
    throw new ApiError(404, "Field officer was not found");
  }

  return prisma.$transaction(async (tx) => {
    const caseRecord = await tx.case.findUnique({
      where: { id: caseId },
      include: { alert: { include: { provider: true } }, agent: true }
    });

    if (!caseRecord) {
      throw new ApiError(404, "Case was not found");
    }

    if (caseRecord.agent && fieldOfficer.fieldOfficer?.areaId !== caseRecord.agent.areaId) {
      throw new ApiError(409, "Choose a field officer from the same area as the case agent");
    }

    if (caseRecord.alert.providerId && fieldOfficer.fieldOfficer?.providerId !== caseRecord.alert.providerId) {
      throw new ApiError(409, "Choose a field officer for the same provider as this case");
    }

    if (assignedById) {
      const assignedBy = await tx.user.findUnique({ where: { id: assignedById }, include: { role: true } });
      if (assignedBy?.role.name === "Operator" && assignedBy.operatorProviderId !== caseRecord.alert.providerId) {
        throw new ApiError(403, "You are not authorized to access this resource");
      }
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
  }, {
    maxWait: 10000,
    timeout: 30000
  });
};

const resolveCase = async ({ caseId, userId }) => {
  return prisma.$transaction(async (tx) => {
    const caseRecord = await tx.case.findUnique({
      where: { id: caseId },
      include: {
        alert: true,
        assignments: {
          where: { assignedToId: userId },
          orderBy: { assignedAt: "desc" },
          take: 1
        }
      }
    });

    if (!caseRecord) {
      throw new ApiError(404, "Case was not found");
    }

    if (!caseRecord.assignments.length) {
      throw new ApiError(403, "Only the assigned field officer can resolve this case");
    }

    if (caseRecord.status === "RESOLVED" || caseRecord.status === "CLOSED") {
      throw new ApiError(409, "Case is already resolved");
    }

    await Promise.all([
      tx.case.update({
        where: { id: caseId },
        data: { status: "RESOLVED" }
      }),
      tx.assignment.update({
        where: { id: caseRecord.assignments[0].id },
        data: { status: "COMPLETED", acceptedAt: caseRecord.assignments[0].acceptedAt || new Date() }
      }),
      tx.alert.update({
        where: { id: caseRecord.alertId },
        data: { status: "RESOLVED" }
      }),
      tx.timeline.create({
        data: {
          caseId,
          event: "Resolved",
          description: "Case marked resolved by the assigned field officer."
        }
      }),
      tx.auditLog.create({
        data: {
          actorId: userId,
          action: "CASE_RESOLVED",
          resource: "Case",
          newValue: { caseId }
        }
      })
    ]);

    return tx.case.findUnique({
      where: { id: caseId },
      include: {
        alert: { include: { provider: true, aiAnalysis: true, evidence: true } },
        agent: { include: { area: true } },
        assignments: { include: { assignedTo: true, assignedBy: true } },
        escalations: true,
        notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });
  }, {
    maxWait: 10000,
    timeout: 30000
  });
};

module.exports = { listCases, getCaseDetails, listFieldOfficers, resolveCase, transferCase };
