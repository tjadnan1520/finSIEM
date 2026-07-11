const providerRepository = require("../repositories/provider.repository");
const agentRepository = require("../repositories/agent.repository");
const transactionRepository = require("../repositories/transaction.repository");
const dashboardService = require("./dashboard.service");
const ApiError = require("../utils/ApiError");

const toDto = (transaction) => ({
  id: transaction.id,
  reference: transaction.reference,
  type: transaction.type,
  status: transaction.status,
  amount: Number(transaction.amount),
  transactionPhone: transaction.transactionPhone,
  provider: transaction.provider.name,
  agent: transaction.agent.name,
  area: transaction.area.name,
  createdAt: transaction.createdAt
});

const listTransactions = async () => {
  const transactions = await transactionRepository.listTransactions();
  return transactions.map(toDto);
};

const createTransaction = async ({ type, amount, transactionPhone, providerId, agentId, userId }) => {
  const [provider, agent] = await Promise.all([
    providerRepository.findProvider(providerId),
    agentRepository.findAgent(agentId)
  ]);

  if (!provider) {
    throw new ApiError(404, "Provider was not found");
  }

  if (!agent) {
    throw new ApiError(404, "Agent was not found");
  }

  if (!provider.balances[0]) {
    throw new ApiError(409, "Provider does not have an initialized balance");
  }

  if (!agent.physicalCash && type === "CASH_IN") {
    throw new ApiError(409, "Agent physical cash is not initialized");
  }

  if (type === "CASH_IN" && Number(provider.balances[0].balance) < Number(amount)) {
    throw new ApiError(409, "Provider has insufficient e-money balance for cash in");
  }

  if (type === "CASH_OUT") {
    const totalPhysicalCash = await transactionRepository.getTotalPhysicalCash();
    if (totalPhysicalCash <= Number(amount)) {
      throw new ApiError(409, "Cash out amount must be less than total physical cash");
    }
  }

  const result = await transactionRepository.createTransactionWorkflow({
    type,
    amount,
    transactionPhone,
    provider,
    agent,
    userId
  });
  dashboardService.invalidateDashboardCache();

  return {
    transaction: toDto(result.transaction),
    liquidityScore: Number(result.snapshot.liquidityScore),
    alertCreated: Boolean(result.alert)
  };
};

module.exports = { listTransactions, createTransaction };
