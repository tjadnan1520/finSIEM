const express = require("express");
const { body, param } = require("express-validator");
const managementController = require("../controllers/management.controller");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate, authorizeRoles("Management"));

router.get("/", managementController.getManagementData);
router.post(
  "/operators",
  [
    body("name").trim().notEmpty().withMessage("Operator name is required"),
    body("email").isEmail().withMessage("A valid operator email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  validateRequest,
  managementController.createOperator
);
router.delete(
  "/operators/:id",
  [param("id").isUUID().withMessage("A valid operator ID is required")],
  validateRequest,
  managementController.removeOperator
);

module.exports = router;
