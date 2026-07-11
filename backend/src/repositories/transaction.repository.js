const prisma = require("../config/prisma");

const listTransactions = () => {
  return prisma.transaction.findMany({
    include: { provider: true, agent: { include: { area: true } }, area: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });
};

const createTransactionWorkflow = async ({ type, amount, provider, agent, userId }) => {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        reference: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type,
        amount,
        providerId: provider.id,
        agentId: agent.id,
        areaId: agent.areaId,
        createdById: userId
      },
      include: { provider: true, agent: true, area: true }
    });

    const providerBalance = provider.balances[0];
    const currentProviderBalance = Number(providerBalance.balance);
    const nextProviderBalance = type === "CASH_IN"
      ? currentProviderBalance + Number(amount)
      : currentProviderBalance - Number(amount);

    await tx.providerBalance.create({
      data: {
        providerId: provider.id,
        balance: nextProviderBalance,
        minimumTarget: providerBalance.minimumTarget,
        feedStatus: "CURRENT"
      }
    });

    const cash = agent.physicalCash;
    const nextCashBalance = type === "CASH_IN"
      ? Number(cash.balance) - Number(amount)
      : Number(cash.balance) + Number(amount);

    await tx.physicalCash.update({
      where: { agentId: agent.id },
      data: { balance: nextCashBalance }
    });

    const totalCash = await tx.physicalCash.aggregate({ _sum: { balance: true } });
    const latestBalances = await tx.providerBalance.findMany({
      distinct: ["providerId"],
      orderBy: [{ providerId: "asc" }, { lastSyncedAt: "desc" }]
    });

    const totalProviderBalance = latestBalances.reduce((sum, item) => sum + Number(item.balance), 0);
    const cashRatio = Math.min(100, (Number(totalCash._sum.balance || 0) / 1000000) * 100);
    const providerBalanceRatio = Math.min(100, (totalProviderBalance / 2500000) * 100);
    const timeToShortage = Math.max(10, Math.min(100, providerBalanceRatio - (type === "CASH_OUT" ? 15 : 0)));
    const liquidityScore = (0.4 * cashRatio) + (0.4 * providerBalanceRatio) + (0.2 * timeToShortage);

    const snapshot = await tx.liquiditySnapshot.create({
      data: {
        providerId: provider.id,
        cashRatio,
        providerBalanceRatio,
        timeToShortage,
        liquidityScore,
        totalPhysicalCash: Number(totalCash._sum.balance || 0),
        totalProviderBalance
      }
    });

    await tx.forecast.createMany({
      data: [30, 60, 120].map((minutes) => ({
        providerId: provider.id,
        snapshotId: snapshot.id,
        horizonMinutes: minutes,
        expectedLiquidity: Math.max(0, liquidityScore - (minutes / 30) * 4),
        expectedDemand: Number(amount) * (minutes / 30),
        projectedShortage: Math.max(0, Number(providerBalance.minimumTarget) - nextProviderBalance),
        confidence: Math.max(55, 94 - (minutes / 30) * 6)
      }))
    });

    const alertNeeded = liquidityScore < 65 || (type === "CASH_OUT" && Number(amount) >= 50000);
    let alert = null;

    if (alertNeeded) {
      const severity = liquidityScore < 20 ? "CRITICAL" : liquidityScore < 40 ? "HIGH" : "MEDIUM";
      const analysis = await tx.aIAnalysis.create({
        data: {
          summary: `${provider.name} liquidity requires operational review after ${transaction.type.replace("_", " ").toLowerCase()}.`,
          reasoning: "Backend liquidity, balance, and transaction velocity signals indicate the provider should be watched before committing further cash movement.",
          evidenceExplanation: `Liquidity score is ${liquidityScore.toFixed(1)} with provider balance ${nextProviderBalance.toFixed(2)}.`,
          recommendation: "Review provider float, verify agent cash position, and keep a human operator in the approval loop.",
          confidence: 78,
          uncertainty: "Provider feed timing and branch demand may change the next forecast window.",
          limitations: "This is decision support only and does not make autonomous operational decisions."
        }
      });

      alert = await tx.alert.create({
        data: {
          title: `${provider.name} liquidity watch`,
          type: "LIQUIDITY",
          severity,
          providerId: provider.id,
          snapshotId: snapshot.id,
          aiAnalysisId: analysis.id,
          evidence: {
            create: [
              { source: "Liquidity Engine", label: "Liquidity Score", value: liquidityScore.toFixed(1), weight: 0.4 },
              { source: "Provider Balance", label: "Latest Balance", value: nextProviderBalance.toFixed(2), weight: 0.3 },
              { source: "Transaction", label: "Amount", value: Number(amount).toFixed(2), weight: 0.3 }
            ]
          }
        }
      });

      const caseRecord = await tx.case.create({
        data: {
          caseNumber: `CASE-${Date.now()}`,
          title: `${provider.name} operational liquidity review`,
          status: "ASSIGNED",
          priority: severity,
          alertId: alert.id
        }
      });

      const assignee = await tx.user.findFirst({ where: { role: { name: "Operator" }, isActive: true } });
      if (assignee) {
        await tx.assignment.create({
          data: { caseId: caseRecord.id, assignedToId: assignee.id, assignedById: userId, status: "ASSIGNED" }
        });
        await tx.notification.create({
          data: {
            userId: assignee.id,
            title: "New operational case assigned",
            body: caseRecord.title
          }
        });
      }

      await tx.timeline.createMany({
        data: [
          { caseId: caseRecord.id, event: "Alert Generated", description: alert.title },
          { caseId: caseRecord.id, event: "Case Created", description: caseRecord.title },
          { caseId: caseRecord.id, event: "Assignment", description: "Operator assignment created by backend rules." }
        ]
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "TRANSACTION_CREATED",
        resource: "Transaction",
        newValue: { transactionId: transaction.id, type, amount: Number(amount), alertId: alert?.id || null }
      }
    });

    return { transaction, snapshot, alert };
  });
};

module.exports = { listTransactions, createTransactionWorkflow };
