export interface PipCalculationResult {
  pips: number;
  multiplier: number;
}

export function getPipMultiplier(pair: string): number {
  const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  if (p.includes("JPY")) {
    return 100; // e.g. USDJPY (110.50 -> 2nd decimal is pip)
  }
  if (p.includes("XAU") || p.includes("GOLD")) {
    return 10; // Gold: $0.10 move = 1 pip
  }
  if (p.includes("BTC") || p.includes("ETH") || p.includes("US30") || p.includes("NAS100") || p.includes("GER30") || p.includes("SPX500")) {
    return 1; // 1 point = 1 unit
  }
  if (p.includes("XAG") || p.includes("SILVER")) {
    return 100;
  }
  
  // Standard Forex (EURUSD, GBPUSD, AUDUSD, USDCAD, USDCHF, NZDUSD)
  return 10000;
}

export function calculatePips(
  pair: string,
  entryPrice: number,
  exitPrice: number,
  direction: "BUY" | "SELL"
): number {
  if (!entryPrice || !exitPrice) return 0;
  const multiplier = getPipMultiplier(pair);
  const diff = direction === "BUY" ? exitPrice - entryPrice : entryPrice - exitPrice;
  return Number((diff * multiplier).toFixed(1));
}

export function calculateRiskReward(
  entryPrice: number,
  exitPrice: number | null | undefined,
  stopLoss: number | null | undefined,
  takeProfit: number | null | undefined,
  direction: "BUY" | "SELL"
): { plannedRR: number | null; realizedRR: number | null } {
  let plannedRR: number | null = null;
  let realizedRR: number | null = null;

  if (entryPrice && stopLoss && takeProfit) {
    const riskDistance = Math.abs(entryPrice - stopLoss);
    const rewardDistance = Math.abs(takeProfit - entryPrice);
    if (riskDistance > 0) {
      plannedRR = Number((rewardDistance / riskDistance).toFixed(2));
    }
  }

  if (entryPrice && stopLoss && exitPrice) {
    const riskDistance = Math.abs(entryPrice - stopLoss);
    const actualGain = direction === "BUY" ? exitPrice - entryPrice : entryPrice - exitPrice;
    if (riskDistance > 0) {
      realizedRR = Number((actualGain / riskDistance).toFixed(2));
    }
  }

  return { plannedRR, realizedRR };
}

export function detectTradingSession(date: Date | string): "ASIAN" | "LONDON" | "NEW_YORK" | "OVERLAP" | "OTHER" {
  const d = typeof date === "string" ? new Date(date) : date;
  // Get UTC hour
  const utcHour = d.getUTCHours();

  // Asian Session: 00:00 - 08:00 UTC
  // London Session: 07:00 - 16:00 UTC
  // NY Session: 12:00 - 21:00 UTC
  // London-NY Overlap: 12:00 - 16:00 UTC

  if (utcHour >= 12 && utcHour < 16) {
    return "OVERLAP";
  }
  if (utcHour >= 7 && utcHour < 12) {
    return "LONDON";
  }
  if (utcHour >= 16 && utcHour < 21) {
    return "NEW_YORK";
  }
  if (utcHour >= 0 && utcHour < 7) {
    return "ASIAN";
  }

  return "OTHER";
}

export const POPULAR_PAIRS = [
  "XAUUSD", // Gold
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "GBPJPY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "NZDUSD",
  "EURJPY",
  "EURGBP",
  "BTCUSD",
  "US30",
  "NAS100",
];

export const EMOTION_TAGS = [
  { label: "Disciplined", color: "emerald", icon: "CheckCircle2" },
  { label: "Patient", color: "emerald", icon: "Timer" },
  { label: "Confident", color: "blue", icon: "ShieldCheck" },
  { label: "FOMO", color: "rose", icon: "Flame" },
  { label: "Revenge Trade", color: "red", icon: "ZapOff" },
  { label: "Hesitant", color: "amber", icon: "HelpCircle" },
  { label: "Greedy", color: "amber", icon: "DollarSign" },
  { label: "Anxious", color: "purple", icon: "AlertTriangle" },
];

export const MISTAKE_TAGS = [
  "Moved SL early",
  "No Stop Loss",
  "Chasing Market",
  "Over-leverage",
  "Exited too early",
  "Late Entry",
  "Ignored News",
  "Overtrading",
  "Trading outside plan",
];

export const DEFAULT_STRATEGIES = [
  { name: "SMC / Order Block", color: "#3b82f6" },
  { name: "Supply & Demand Breakout", color: "#10b981" },
  { name: "Support & Resistance Retest", color: "#8b5cf6" },
  { name: "Trend Following Pullback", color: "#06b6d4" },
  { name: "London Breakout", color: "#f59e0b" },
  { name: "Scalping 1-Minute", color: "#ec4899" },
];
