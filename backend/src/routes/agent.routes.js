const express = require("express");
const { body, param } = require("express-validator");
const agentController = require("../controllers/agent.controller");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", authenticate, agentController.listAgents);
router.post(
  "/",
  authenticate,
  authorizeRoles("Management"),
  [
    body("name").trim().notEmpty().withMessage("Agent name is required"),
    body("code").trim().notEmpty().withMessage("Agent code is required"),
    body("phone").trim().notEmpty().withMessage("Agent phone is required"),
    body("areaId").isUUID().withMessage("A valid area is required")
  ],
  validateRequest,
  agentController.createAgent
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Management"),
  [param("id").isUUID().withMessage("A valid agent ID is required")],
  validateRequest,
  agentController.removeAgent
);

module.exports = router;
