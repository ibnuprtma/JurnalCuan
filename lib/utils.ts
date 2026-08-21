import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = "USD"): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatSignedCurrency(amount: number | null | undefined, currency: string = "USD"): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";
  if (amount === 0) return "$0.00";
  
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${formatCurrency(amount, currency)}`;
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
