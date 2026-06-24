export const SELECTED_KEY = "tcc_selected_phase";
export const THEME_KEY = "tcc_theme";
export const CHECK_KEY_PREFIX = "tcc_cl_";
export const LOCKIN_KEY_PREFIX = "tcc_li_";
export const CHECK_TIME_KEY_PREFIX = "tcc_ct_";
export const CARD_ORDER_KEY_PREFIX = "tcc_card_order_";
export const CUSTOM_PHASES_KEY = "tcc_custom_phases";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getPHT() {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getET() {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getETDate() {
  const d = new Date();
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const p = f.formatToParts(d);
  const g = (t) => parseInt(p.find((x) => x.type === t).value, 10);
  return new Date(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
}

export function getCountdown() {
  const etNow = getETDate();
  const target = new Date(etNow);
  target.setHours(10, 0, 0, 0);
  if (etNow >= target) target.setDate(target.getDate() + 1);
  const diff = target - etNow;
  if (diff <= 0) return "\u2014";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

export function fmtPnL(n) {
  if (n === 0) return "$0.00";
  const a = Math.abs(n).toFixed(2);
  return n > 0 ? "+$" + a : "-$" + a;
}

export function pnlClass(n) {
  if (n > 0) return "pnl-positive";
  if (n < 0) return "pnl-negative";
  return "pnl-zero";
}

export function fmtDT(d) {
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}