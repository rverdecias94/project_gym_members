import moment from "moment/moment";

export function getPlanCostsForMonth(monthNumber) {
  const month = Number.isFinite(monthNumber) ? monthNumber : 1;
  if (month <= 1) return { standard: 0, premium: 0, diff: 0 };
  if (month === 2) return { standard: 12, premium: 19.6, diff: 7.6 };
  if (month === 3) return { standard: 15, premium: 19.6, diff: 4.6 };
  return { standard: 15, premium: 28, diff: 13 };
}

export function roundMoney(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function formatUsd(value) {
  return roundMoney(value).toFixed(2);
}

export function computePremiumUpgradePreview({ createdAt, nextPaymentDate, today = moment() } = {}) {
  const created = createdAt ? moment(createdAt).startOf("day") : null;
  const nextPayment = nextPaymentDate ? moment(nextPaymentDate).startOf("day") : null;
  const todayDay = today ? moment(today).startOf("day") : moment().startOf("day");

  const getAccountMonthAtDate = (at) => {
    if (!created?.isValid() || !at?.isValid()) return 1;
    let fullMonths = at.diff(created, "months");
    if (at.date() < created.date()) fullMonths -= 1;
    return Math.max(1, fullMonths + 1);
  };

  const accountMonthToday = getAccountMonthAtDate(todayDay);
  const monthAtNextPayment = getAccountMonthAtDate(nextPayment);

  const currentCosts = getPlanCostsForMonth(accountMonthToday);
  const premiumCostsAtNextPayment = getPlanCostsForMonth(monthAtNextPayment);

  const daysRemainingRaw = nextPayment?.isValid()
    ? Math.max(0, nextPayment.diff(todayDay, "days"))
    : 0;
  const daysRemaining = Math.min(30, daysRemainingRaw);
  const proratedDiff = roundMoney((currentCosts.diff / 30) * daysRemaining);
  const totalNextInvoice = roundMoney(premiumCostsAtNextPayment.premium + proratedDiff);

  return {
    accountMonth: accountMonthToday,
    nextBillingDate: nextPayment?.isValid() ? nextPayment.format("YYYY-MM-DD") : "-",
    daysRemaining,
    premiumCost: premiumCostsAtNextPayment.premium,
    proratedDiff,
    totalNextInvoice,
  };
}
