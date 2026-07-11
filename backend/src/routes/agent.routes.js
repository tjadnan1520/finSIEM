const express = require("express");
const agentController = require("../controllers/agent.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, agentController.listAgents);

module.exports = router;
