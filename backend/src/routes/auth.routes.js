const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validateRequest,
  authController.login
);

router.get("/me", authenticate, authController.me);

module.exports = router;
