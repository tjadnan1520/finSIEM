const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");
const dashboardService = require("./services/dashboard.service");

const server = app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
  dashboardService.warmDashboardCache().catch(() => {});
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
