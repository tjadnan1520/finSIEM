export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const formatDateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const formatScore = (value) => `${Number(value || 0).toFixed(1)}`;
