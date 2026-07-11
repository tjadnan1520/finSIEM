const prisma = require("../src/config/prisma");
const caseService = require("../src/services/case.service");
const alertService = require("../src/services/alert.service");
const userRepository = require("../src/repositories/user.repository");
const authService = require("../src/services/auth.service");

const run = async () => {
  const [operator, otherOperator, provider, agent] = await Promise.all([
    userRepository.findByEmail("bkash.operator@finsiem.local"),
    userRepository.findByEmail("nagad.operator@finsiem.local"),
    prisma.provider.findUnique({ where: { code: "BKASH" } }),
    prisma.agent.findFirst({
      where: { code: { not: { startsWith: "REMOVED-" } } },
      include: { area: true },
      orderBy: { createdAt: "asc" }
    })
  ]);

  if (!operator) throw new Error("Operator demo user is missing.");
  if (!operator.operatorProviderId) throw new Error("Operator is missing provider assignment.");
  if (!agent) throw new Error("No active agent is available for smoke test.");
  if (!provider) throw new Error("bKash provider is missing.");

  const alert = await prisma.alert.create({
    data: {
      title: "Field officer smoke test alert",
      type: "RISK",
      severity: "HIGH",
      providerId: provider?.id || null
    }
  });

  const caseRecord = await prisma.case.create({
    data: {
      caseNumber: `CASE-FO-SMOKE-${Date.now()}`,
      title: "Field officer smoke test case",
      status: "OPEN",
      priority: "HIGH",
      alertId: alert.id,
      agentId: agent.id
    }
  });

  const officers = await caseService.listFieldOfficers({
    caseId: caseRecord.id,
    region: agent.area.region,
    user: {
      id: operator.id,
      role: operator.role.name,
      operatorProviderId: operator.operatorProviderId
    }
  });
  const officer = officers.find((item) => item.email === "fieldofficer@finsiem.local") || officers[0];
  if (!officer) throw new Error(`No field officer returned for ${agent.area.name}.`);
  if (officers.some((item) => item.area !== agent.area.name || item.region !== agent.area.region || item.providerId !== provider.id)) {
    throw new Error("Field officer filter returned an officer outside the case provider or area.");
  }

  const operatorCases = await caseService.listCases({
    id: operator.id,
    role: operator.role.name,
    operatorProviderId: operator.operatorProviderId
  });
  if (!operatorCases.some((item) => item.id === caseRecord.id)) {
    throw new Error("Provider operator cannot see own provider case.");
  }

  const operatorAlerts = await alertService.listAlerts({
    id: operator.id,
    role: operator.role.name,
    operatorProviderId: operator.operatorProviderId
  });
  if (!operatorAlerts.some((item) => item.id === alert.id)) {
    throw new Error("Provider operator cannot see own provider alert.");
  }

  if (otherOperator) {
    const otherOperatorCases = await caseService.listCases({
      id: otherOperator.id,
      role: otherOperator.role.name,
      operatorProviderId: otherOperator.operatorProviderId
    });
    if (otherOperatorCases.some((item) => item.id === caseRecord.id)) {
      throw new Error("Different provider operator can see the bKash case.");
    }
    const otherOperatorAlerts = await alertService.listAlerts({
      id: otherOperator.id,
      role: otherOperator.role.name,
      operatorProviderId: otherOperator.operatorProviderId
    });
    if (otherOperatorAlerts.some((item) => item.id === alert.id)) {
      throw new Error("Different provider operator can see the bKash alert.");
    }
  }

  const otherRegion = await prisma.area.findFirst({
    where: { region: { not: agent.area.region } }
  });
  if (otherRegion) {
    const mismatchedOfficers = await caseService.listFieldOfficers({
      caseId: caseRecord.id,
      region: otherRegion.region,
      user: {
        id: operator.id,
        role: operator.role.name,
        operatorProviderId: operator.operatorProviderId
      }
    });
    if (mismatchedOfficers.length) {
      throw new Error("Region filter returned officers for a mismatched case area.");
    }
  }

  const login = await authService.login({ email: officer.email, password: "Password123!" });
  if (login.user.role !== "Field Officer") {
    throw new Error(`Expected Field Officer role, received ${login.user.role}.`);
  }

  await caseService.transferCase({
    caseId: caseRecord.id,
    assignedToId: officer.id,
    assignedById: operator.id
  });

  const officerUser = await userRepository.findByEmail(officer.email);
  const officerContext = {
    id: officerUser.id,
    name: officerUser.name,
    email: officerUser.email,
    role: officerUser.role.name
  };
  const visibleCases = await caseService.listCases(officerContext);
  const isVisible = visibleCases.some((item) => item.id === caseRecord.id);
  if (!isVisible) throw new Error("Transferred case is not visible to the assigned field officer.");

  const resolved = await caseService.resolveCase({
    caseId: caseRecord.id,
    userId: officer.id
  });

  if (resolved.status !== "RESOLVED" || resolved.alert.status !== "RESOLVED") {
    throw new Error("Resolve flow did not close both case and alert.");
  }

  console.log(JSON.stringify({
    caseId: caseRecord.id,
    targetAgent: agent.name,
    targetAgentPhone: agent.phone,
    targetAgentArea: agent.area.name,
    provider: provider.name,
    operatorName: operator.name,
    returnedOfficerCountForArea: officers.length,
    officerName: officer.name,
    officerEmail: officer.email,
    officerCode: officer.officerCode,
    officerProvider: officer.provider,
    officerArea: officer.area,
    officerRole: login.user.role,
    visibleToOfficer: true,
    resolvedCaseStatus: resolved.status,
    resolvedAlertStatus: resolved.alert.status
  }, null, 2));
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
