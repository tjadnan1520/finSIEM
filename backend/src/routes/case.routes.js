const express = require("express");
const { param } = require("express-validator");
const caseController = require("../controllers/case.controller");
const authenticate = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", authenticate, caseController.listCases);
router.get("/:id", authenticate, [param("id").isUUID()], validateRequest, caseController.getCaseDetails);

module.exports = router;
