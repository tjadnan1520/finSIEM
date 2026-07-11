const prisma = require("../config/prisma");

const getAnalytics = async () => {
  const metrics = await prisma.analytics.findMany({
    include: { provider: true, area: true },
    orderBy: { recordedAt: "desc" },
    take: 100
  });

  return metrics.map((metric) => ({
    id: metric.id,
    metric: metric.metric,
    value: Number(metric.value),
    trend: Number(metric.trend),
    provider: metric.provider?.name || null,
    area: metric.area?.name || null,
    recordedAt: metric.recordedAt
  }));
};

module.exports = { getAnalytics };
