const express = require("express");
const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const providerRoutes = require("./provider.routes");
const agentRoutes = require("./agent.routes");
const transactionRoutes = require("./transaction.routes");
const alertRoutes = require("./alert.routes");
const caseRoutes = require("./case.routes");
const analyticsRoutes = require("./analytics.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/providers", providerRoutes);
router.use("/agents", agentRoutes);
router.use("/transactions", transactionRoutes);
router.use("/alerts", alertRoutes);
router.use("/cases", caseRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
