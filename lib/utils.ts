import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currency: string = "USD"): string {
  switch (currency?.toUpperCase()) {
    case "IDR":
      return "Rp";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    case "SGD":
      return "S$";
    case "AUD":
      return "A$";
    default:
      return "$";
  }
}

export function formatCurrency(amount: number | null | undefined, currency: string = "USD"): string {
  const cur = currency?.toUpperCase() || "USD";
  if (amount === null || amount === undefined || isNaN(amount)) {
    return cur === "IDR" ? "Rp 0" : `${getCurrencySymbol(cur)}0.00`;
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (cur === "IDR") {
    const formattedNum = Math.round(absAmount).toLocaleString("id-ID");
    const result = `Rp ${formattedNum}`;
    return isNegative ? `-${result}` : result;
  }

  if (cur === "JPY") {
    const formattedNum = Math.round(absAmount).toLocaleString("ja-JP");
    const result = `¥${formattedNum}`;
    return isNegative ? `-${result}` : result;
  }
  
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatSignedCurrency(amount: number | null | undefined, currency: string = "USD"): string {
  const cur = currency?.toUpperCase() || "USD";
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return cur === "IDR" ? "Rp 0" : `${getCurrencySymbol(cur)}0.00`;
  }
  
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${formatCurrency(amount, cur)}`;
}

export function formatPercent(value: number | null | undefined, includeSign: boolean = false): string {
  if (value === null || value === undefined || isNaN(value)) return "0.0%";
  const prefix = includeSign && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
