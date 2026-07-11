const express = require("express");
const { body, param } = require("express-validator");
const providerController = require("../controllers/provider.controller");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", authenticate, providerController.listProviders);
router.post(
  "/",
  authenticate,
  authorizeRoles("Management"),
  [
    body("name").trim().notEmpty().withMessage("Provider name is required"),
    body("code").trim().notEmpty().withMessage("Provider code is required"),
    body("status").optional().trim().notEmpty()
  ],
  validateRequest,
  providerController.createProvider
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Management"),
  [param("id").isUUID().withMessage("A valid provider ID is required")],
  validateRequest,
  providerController.removeProvider
);

module.exports = router;
