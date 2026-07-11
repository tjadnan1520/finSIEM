const providerRepository = require("../repositories/provider.repository");

const formatProvider = (provider, role) => {
  const balance = provider.balances[0];
  const baseProvider = {
    id: provider.id,
    name: provider.name,
    code: provider.code,
    status: provider.status
  };

  if (role === "Operator") {
    return baseProvider;
  }

  return {
    ...baseProvider,
    balance: balance ? Number(balance.balance) : 0,
    minimumTarget: balance ? Number(balance.minimumTarget) : 0,
    feedStatus: balance?.feedStatus || "UNKNOWN",
    lastSyncedAt: balance?.lastSyncedAt || null
  };
};

const listProviders = async (role) => {
  const providers = await providerRepository.listProviders();
  return providers.map((provider) => formatProvider(provider, role));
};

module.exports = { listProviders, formatProvider };
