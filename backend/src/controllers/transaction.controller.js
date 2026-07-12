const transactionService = require("../services/transaction.service");
const { success } = require("../utils/apiResponse");

const listTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.listTransactions(req.user);
    success(res, transactions, "Transactions loaded");
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction({
      ...req.body,
      user: req.user
    });
    success(res, transaction, "Transaction processed", 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { listTransactions, createTransaction };
