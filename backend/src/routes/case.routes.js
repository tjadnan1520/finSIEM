const express = require("express");
const { body, param, query } = require("express-validator");
const caseController = require("../controllers/case.controller");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", authenticate, caseController.listCases);
router.get(
  "/field-officers",
  authenticate,
  authorizeRoles("Operator", "Management"),
  [
    query("caseId").optional().isUUID().withMessage("A valid case ID is required"),
    query("areaId").optional().isUUID().withMessage("A valid area ID is required"),
    query("providerId").optional().isUUID().withMessage("A valid provider ID is required"),
    query("region").optional().isString().trim()
  ],
  validateRequest,
  caseController.listFieldOfficers
);
router.get("/:id", authenticate, [param("id").isUUID()], validateRequest, caseController.getCaseDetails);
router.post(
  "/:id/transfer",
  authenticate,
  authorizeRoles("Operator", "Management"),
  [
    param("id").isUUID().withMessage("A valid case ID is required"),
    body("assignedToId").isUUID().withMessage("A valid field officer ID is required")
  ],
  validateRequest,
  caseController.transferCase
);
router.post(
  "/:id/resolve",
  authenticate,
  authorizeRoles("Field Officer", "Agent"),
  [param("id").isUUID().withMessage("A valid case ID is required")],
  validateRequest,
  caseController.resolveCase
);

module.exports = router;
