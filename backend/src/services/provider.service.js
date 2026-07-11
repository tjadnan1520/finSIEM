const providerRepository = require("../repositories/provider.repository");

const formatProvider = (provider) => {
  const balance = provider.balances[0];
  return {
    id: provider.id,
    name: provider.name,
    code: provider.code,
    status: provider.status,
    balance: balance ? Number(balance.balance) : 0,
    minimumTarget: balance ? Number(balance.minimumTarget) : 0,
    feedStatus: balance?.feedStatus || "UNKNOWN",
    lastSyncedAt: balance?.lastSyncedAt || null
  };
};

const listProviders = async () => {
  const providers = await providerRepository.listProviders();
  return providers.map(formatProvider);
};

module.exports = { listProviders, formatProvider };
