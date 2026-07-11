const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const run = async () => {
  const provider = await prisma.provider.findFirst({ where: { status: { not: "REMOVED" } } });
  const agent = await prisma.agent.findFirst({
    where: { code: { not: { startsWith: "REMOVED-" } } },
    orderBy: { createdAt: "asc" }
  });

  if (!agent) {
    throw new Error("No active agent is available for test case creation.");
  }

  const alert = await prisma.alert.create({
    data: {
      title: "Field officer workflow test alert",
      type: "RISK",
      severity: "HIGH",
      providerId: provider?.id || null
    }
  });

  const caseRecord = await prisma.case.create({
    data: {
      caseNumber: `CASE-FO-TEST-${Date.now()}`,
      title: "Field officer workflow test case",
      status: "OPEN",
      priority: "HIGH",
      alertId: alert.id,
      agentId: agent.id
    }
  });

  console.log(JSON.stringify({ caseId: caseRecord.id, caseNumber: caseRecord.caseNumber }));
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
