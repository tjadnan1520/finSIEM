const express = require("express");
const { body } = require("express-validator");
const transactionController = require("../controllers/transaction.controller");
const authenticate = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const transactionValidation = [
  body("type").isIn(["CASH_IN", "CASH_OUT"]).withMessage("Transaction type must be CASH_IN or CASH_OUT"),
  body("amount").isFloat({ min: 1 }).withMessage("Amount must be greater than zero"),
  body("providerId").isUUID().withMessage("A valid provider ID is required"),
  body("agentId").isUUID().withMessage("A valid agent ID is required")
];

router.get("/", authenticate, transactionController.listTransactions);
router.post("/", authenticate, transactionValidation, validateRequest, transactionController.createTransaction);

module.exports = router;
