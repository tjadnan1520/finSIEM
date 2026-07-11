const express = require("express");
const { param } = require("express-validator");
const alertController = require("../controllers/alert.controller");
const authenticate = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", authenticate, alertController.listAlerts);
router.get("/:id", authenticate, [param("id").isUUID()], validateRequest, alertController.getAlertDetails);

module.exports = router;
