const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const password = async () => bcrypt.hash("Password123!", 12);

const reset = async () => {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timeline.deleteMany();
  await prisma.caseNote.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.case.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.liquiditySnapshot.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.physicalCash.deleteMany();
  await prisma.providerBalance.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
};

const createReferenceData = async () => {
  const roles = {};
  for (const role of [
    ["Field Officer", "Field operation user"],
    ["Agent", "Cash point record owner"],
    ["Operator", "Operations analyst and case investigator"],
    ["Management", "Management dashboard and escalation authority"]
  ]) {
    roles[role[0]] = await prisma.role.create({
      data: { name: role[0], description: role[1] }
    });
  }

  const hash = await password();
  const users = {
    agent: await prisma.user.create({
      data: {
        name: "Nadia Rahman",
        email: "fieldofficer@finsiem.local",
        passwordHash: hash,
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Nadia%20Rahman",
        roleId: roles["Field Officer"].id
      }
    }),
    operator: await prisma.user.create({
      data: {
        name: "Farhan Chowdhury",
        email: "operator@finsiem.local",
        passwordHash: hash,
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Farhan%20Chowdhury",
        roleId: roles.Operator.id
      }
    }),
    manager: await prisma.user.create({
      data: {
        name: "Maliha Karim",
        email: "management@finsiem.local",
        passwordHash: hash,
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Maliha%20Karim",
        roleId: roles.Management.id
      }
    })
  };

  const areas = {
    dhanmondi: await prisma.area.create({ data: { name: "Dhanmondi", region: "Dhaka Metro" } }),
    uttara: await prisma.area.create({ data: { name: "Uttara", region: "Dhaka North" } }),
    sylhet: await prisma.area.create({ data: { name: "Zindabazar", region: "Sylhet" } })
  };

  const agents = {
    dhanmondi: await prisma.agent.create({
      data: {
        code: "AG-DHN-101",
        name: "Nadia Rahman",
        phone: "+8801711000101",
        userId: users.agent.id,
        areaId: areas.dhanmondi.id
      }
    }),
    uttara: await prisma.agent.create({
      data: {
        code: "AG-UTR-204",
        name: "Rafiq Islam",
        phone: "+8801711000204",
        areaId: areas.uttara.id
      }
    }),
    sylhet: await prisma.agent.create({
      data: {
        code: "AG-SYL-312",
        name: "Samira Begum",
        phone: "+8801711000312",
        areaId: areas.sylhet.id
      }
    })
  };

  await prisma.physicalCash.createMany({
    data: [
      { agentId: agents.dhanmondi.id, areaId: areas.dhanmondi.id, balance: 50000, minimumTarget: 25000 },
      { agentId: agents.uttara.id, areaId: areas.uttara.id, balance: 45000, minimumTarget: 25000 },
      { agentId: agents.sylhet.id, areaId: areas.sylhet.id, balance: 40000, minimumTarget: 25000 }
    ]
  });

  const providers = {
    bkash: await prisma.provider.create({ data: { name: "bKash", code: "BKASH", status: "ACTIVE" } }),
    nagad: await prisma.provider.create({ data: { name: "Nagad", code: "NAGAD", status: "ACTIVE" } }),
    rocket: await prisma.provider.create({ data: { name: "Rocket", code: "ROCKET", status: "DELAYED_FEED" } })
  };

  await prisma.providerBalance.createMany({
    data: [
      { providerId: providers.bkash.id, balance: 145000, minimumTarget: 100000, feedStatus: "CURRENT" },
      { providerId: providers.nagad.id, balance: 130000, minimumTarget: 100000, feedStatus: "CURRENT" },
      { providerId: providers.rocket.id, balance: 115000, minimumTarget: 100000, feedStatus: "DELAYED" }
    ]
  });

  return { users, areas, agents, providers };
};

const createOperationalData = async ({ users, areas, agents, providers }) => {
  const transactions = [
    ["TXN-DEMO-1001", "CASH_IN", 12000, "01713001001", providers.bkash.id, agents.dhanmondi.id, areas.dhanmondi.id],
    ["TXN-DEMO-1002", "CASH_OUT", 9000, "01814002002", providers.nagad.id, agents.uttara.id, areas.uttara.id],
    ["TXN-DEMO-1003", "CASH_OUT", 11000, "01915003003", providers.rocket.id, agents.sylhet.id, areas.sylhet.id],
    ["TXN-DEMO-1004", "CASH_IN", 8000, "01616004004", providers.bkash.id, agents.uttara.id, areas.uttara.id],
    ["TXN-DEMO-1005", "CASH_OUT", 7000, "01517005005", providers.nagad.id, agents.dhanmondi.id, areas.dhanmondi.id],
    ["TXN-DEMO-1006", "CASH_OUT", 11000, "01318006006", providers.rocket.id, agents.sylhet.id, areas.sylhet.id]
  ];

  for (const [reference, type, amount, transactionPhone, providerId, agentId, areaId] of transactions) {
    await prisma.transaction.create({
      data: { reference, type, amount, transactionPhone, providerId, agentId, areaId, createdById: users.agent.id }
    });
  }

  const healthySnapshot = await prisma.liquiditySnapshot.create({
    data: {
      providerId: providers.bkash.id,
      cashRatio: 78,
      providerBalanceRatio: 84,
      timeToShortage: 90,
      liquidityScore: 82.8,
      totalPhysicalCash: 135000,
      totalProviderBalance: 390000
    }
  });

  const warningSnapshot = await prisma.liquiditySnapshot.create({
    data: {
      providerId: providers.nagad.id,
      cashRatio: 54,
      providerBalanceRatio: 43,
      timeToShortage: 48,
      liquidityScore: 48.4,
      totalPhysicalCash: 135000,
      totalProviderBalance: 390000
    }
  });

  const criticalSnapshot = await prisma.liquiditySnapshot.create({
    data: {
      providerId: providers.rocket.id,
      cashRatio: 32,
      providerBalanceRatio: 24,
      timeToShortage: 18,
      liquidityScore: 26,
      totalPhysicalCash: 135000,
      totalProviderBalance: 390000
    }
  });

  for (const snapshot of [healthySnapshot, warningSnapshot, criticalSnapshot]) {
    await prisma.forecast.createMany({
      data: [30, 60, 120].map((horizonMinutes) => ({
        providerId: snapshot.providerId,
        snapshotId: snapshot.id,
        horizonMinutes,
        expectedLiquidity: Math.max(5, Number(snapshot.liquidityScore) - horizonMinutes / 10),
        expectedDemand: horizonMinutes * 250,
        projectedShortage: snapshot.id === criticalSnapshot.id ? horizonMinutes * 700 : horizonMinutes * 150,
        confidence: snapshot.id === criticalSnapshot.id ? 58 : 84
      }))
    });
  }

  const ai = {
    nagad: await prisma.aIAnalysis.create({
      data: {
        summary: "Nagad balance is below target while demand remains steady in Uttara.",
        reasoning: "Liquidity score is in warning range, provider float is below the operating target, and recent cash-out volume is above the local baseline.",
        evidenceExplanation: "Provider balance ratio and time-to-shortage are the strongest signals.",
        recommendation: "Ask operations to verify incoming float timing and keep large cash-out requests under review until balance recovers.",
        confidence: 82,
        uncertainty: "A delayed provider top-up could improve this outlook within the next hour.",
        limitations: "The analysis supports human review and does not authorize movement by itself."
      }
    }),
    rocket: await prisma.aIAnalysis.create({
      data: {
        summary: "Rocket feed delay and repeated cash-out pattern require immediate operational attention.",
        reasoning: "Low liquidity, delayed provider feed, and repeated amount pattern reduce confidence in the current operating state.",
        evidenceExplanation: "Liquidity score is critical and provider feed status is delayed.",
        recommendation: "Assign an operator to verify Rocket feed freshness, check Sylhet agent cash position, and prepare escalation if the feed remains delayed.",
        confidence: 61,
        uncertainty: "The delayed feed may understate or overstate current provider balance.",
        limitations: "No fraud verdict is produced; this is an operational decision aid."
      }
    })
  };

  const nagadAlert = await prisma.alert.create({
    data: {
      title: "Nagad liquidity warning in Uttara",
      type: "LIQUIDITY",
      severity: "HIGH",
      providerId: providers.nagad.id,
      snapshotId: warningSnapshot.id,
      aiAnalysisId: ai.nagad.id,
      evidence: {
        create: [
          { source: "Liquidity Engine", label: "Liquidity Score", value: "48.4", weight: 0.4 },
          { source: "Provider Balance", label: "Balance vs Target", value: "130000 / 100000", weight: 0.3 },
          { source: "Forecast Engine", label: "One Hour Outlook", value: "Projected pressure remains elevated", weight: 0.3 }
        ]
      }
    }
  });

  const rocketAlert = await prisma.alert.create({
    data: {
      title: "Rocket critical liquidity and low confidence",
      type: "CONFIDENCE",
      severity: "CRITICAL",
      providerId: providers.rocket.id,
      snapshotId: criticalSnapshot.id,
      aiAnalysisId: ai.rocket.id,
      evidence: {
        create: [
          { source: "Liquidity Engine", label: "Liquidity Score", value: "26.0", weight: 0.4 },
          { source: "Confidence Engine", label: "Feed Status", value: "DELAYED", weight: 0.35 },
          { source: "Risk Engine", label: "Repeated Amount Pattern", value: "11000 repeated", weight: 0.25 }
        ]
      }
    }
  });

  const nagadCase = await prisma.case.create({
    data: {
      caseNumber: "CASE-DEMO-2001",
      title: "Review Nagad Uttara liquidity position",
      status: "OPEN",
      priority: "HIGH",
      alertId: nagadAlert.id
    }
  });

  const rocketCase = await prisma.case.create({
    data: {
      caseNumber: "CASE-DEMO-2002",
      title: "Escalate Rocket Sylhet feed and float review",
      status: "ESCALATED",
      priority: "CRITICAL",
      alertId: rocketAlert.id
    }
  });

  await prisma.escalation.create({
    data: {
      caseId: rocketCase.id,
      reason: "Critical severity with delayed provider feed and repeated high-value cash-outs",
      fromTeam: "Risk Analyst",
      toTeam: "Management"
    }
  });

  await prisma.caseNote.createMany({
    data: [
      { caseId: nagadCase.id, authorId: users.operator.id, body: "Provider operations contacted for expected float settlement window." },
      { caseId: rocketCase.id, authorId: users.manager.id, body: "Management review accepted; waiting for Rocket feed confirmation." }
    ]
  });

  await prisma.timeline.createMany({
    data: [
      { caseId: nagadCase.id, event: "Alert Generated", description: "Alert recorded for review." },
      { caseId: nagadCase.id, event: "Review", description: "Waiting for a field officer transfer." },
      { caseId: rocketCase.id, event: "Alert Generated", description: "Critical confidence and liquidity alert created." },
      { caseId: rocketCase.id, event: "Case Created", description: "Case opened from alert activity." },
      { caseId: rocketCase.id, event: "Management Review", description: "Sent to management for review." }
    ]
  });

  await prisma.notification.createMany({
    data: [
      { userId: users.operator.id, title: "New case available", body: "CASE-DEMO-2001 is ready for review." },
      { userId: users.manager.id, title: "Critical case available", body: "CASE-DEMO-2002 is ready for review." }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      { actorId: users.agent.id, action: "TRANSACTION_CREATED", resource: "Transaction", newValue: { reference: "TXN-DEMO-1003" } },
      { actorId: users.manager.id, action: "CASE_REVIEWED", resource: "Case", newValue: { caseNumber: "CASE-DEMO-2002" } }
    ]
  });

  await prisma.analytics.createMany({
    data: [
      { metric: "liquidity_score", value: 82.8, trend: 3.6, providerId: providers.bkash.id, snapshotId: healthySnapshot.id },
      { metric: "liquidity_score", value: 48.4, trend: -8.2, providerId: providers.nagad.id, snapshotId: warningSnapshot.id },
      { metric: "liquidity_score", value: 26, trend: -14.5, providerId: providers.rocket.id, snapshotId: criticalSnapshot.id },
      { metric: "average_confidence", value: 71.5, trend: -6.8 },
      { metric: "open_cases", value: 2, trend: 1 },
      { metric: "resolution_time_minutes", value: 42, trend: -5 },
      { metric: "area_risk", value: 68, trend: 10.5, areaId: areas.sylhet.id },
      { metric: "provider_health", value: 91, trend: 2.5, providerId: providers.bkash.id }
    ]
  });
};

const main = async () => {
  await reset();
  const referenceData = await createReferenceData();
  await createOperationalData(referenceData);
  console.log("Seed completed with Field Officer, Operator, and Management demo users.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
