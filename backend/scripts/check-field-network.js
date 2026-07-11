const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const run = async () => {
  const [agentCount, officerCount, areaCount, operatorCount, samples] = await Promise.all([
    prisma.agent.count({ where: { code: { not: { startsWith: "REMOVED-" } } } }),
    prisma.fieldOfficer.count({ where: { isAvailable: true, providerId: { not: null } } }),
    prisma.area.count(),
    prisma.user.count({ where: { role: { name: "Operator" }, operatorProviderId: { not: null } } }),
    prisma.fieldOfficer.findMany({
      where: { providerId: { not: null } },
      take: 5,
      orderBy: { code: "asc" },
      include: { user: true, area: true, provider: true }
    })
  ]);

  console.log(JSON.stringify({
    areaCount,
    agentCount,
    providerOperatorCount: operatorCount,
    officerCount,
    samples: samples.map((officer) => ({
      code: officer.code,
      name: officer.user.name,
      provider: officer.provider?.name || null,
      area: officer.area.name,
      region: officer.area.region
    }))
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
