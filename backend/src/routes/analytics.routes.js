const express = require("express");
const analyticsController = require("../controllers/analytics.controller");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, authorizeRoles("Management", "Operator"), analyticsController.getAnalytics);

module.exports = router;
