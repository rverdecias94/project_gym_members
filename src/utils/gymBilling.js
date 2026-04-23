import dayjs from "dayjs";

export function roundMoney(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function getGymPlanCostForMonth({ isPremium, monthNumber }) {
  const month = Number.isFinite(monthNumber) ? monthNumber : 1;
  if (month <= 1) return 0;

  if (isPremium) {
    if (month === 2 || month === 3) return 19.6;
    return 28;
  }

  if (month === 2) return 12;
  return 15;
}

export function getGymUpgradeDiffForMonth(monthNumber) {
  const month = Number.isFinite(monthNumber) ? monthNumber : 1;
  if (month <= 1) return 0;
  if (month === 2) return 7.6;
  if (month === 3) return 4.6;
  return 13;
}

export function getAccountMonthAtDate({ createdAt, atDate }) {
  const created = dayjs(createdAt);
  const at = dayjs(atDate);
  if (!created.isValid() || !at.isValid()) return 1;

  let fullMonths = at.diff(created, "month");
  if (at.date() < created.date()) {
    fullMonths -= 1;
  }
  return Math.max(1, fullMonths + 1);
}

export function computeGymNextBillingAmount({ createdAt, nextPaymentDate, isPremium, additionalCostsAmount }) {
  const monthAtNextPayment = getAccountMonthAtDate({ createdAt, atDate: nextPaymentDate });
  const base = getGymPlanCostForMonth({ isPremium, monthNumber: monthAtNextPayment });
  const extras = roundMoney(additionalCostsAmount ?? 0);
  return roundMoney(base + extras);
}

export function computeGymUpgradeProratedCost({ createdAt, nextPaymentDate, changeDate }) {
  const currentMonth = getAccountMonthAtDate({ createdAt, atDate: changeDate });
  const diff = getGymUpgradeDiffForMonth(currentMonth);

  const nextPayment = dayjs(nextPaymentDate);
  const change = dayjs(changeDate);
  const daysRemainingRaw = nextPayment.isValid() && change.isValid()
    ? Math.max(0, nextPayment.startOf("day").diff(change.startOf("day"), "day"))
    : 0;
  const daysRemaining = Math.min(30, daysRemainingRaw);
  const prorated = roundMoney((diff / 30) * daysRemaining);

  return {
    currentMonth,
    daysRemaining,
    diff,
    prorated,
  };
}

