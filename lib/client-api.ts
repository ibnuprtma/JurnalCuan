import { SampleTrade } from "./sample-data";
import { calculatePips, calculateRiskReward, detectTradingSession } from "./forex-utils";

export async function fetchTradesClient(accountId?: string): Promise<SampleTrade[]> {
  try {
    const url = accountId && accountId !== "all" ? `/api/trades?accountId=${accountId}` : "/api/trades";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.trades)) {
        return data.trades;
      }
    }
  } catch (e) {
    console.warn("Client fetchTrades error:", e);
  }
  return [];
}

export async function fetchAccountsClient(): Promise<any[]> {
  try {
    const res = await fetch("/api/accounts", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.accounts) && data.accounts.length > 0) {
        return data.accounts;
      }
    }
  } catch (e) {
    console.warn("Client fetchAccounts error:", e);
  }
  return [
    { id: "all", name: "Semua Akun (Aggregated)", broker: "Semua Portofolio", currentBalance: 0, currency: "USD" },
    { id: "default-account", name: "Personal Account", broker: "Forex MT5", currentBalance: 0, currency: "USD" },
  ];
}

export async function saveTradeClient(tradeData: any): Promise<SampleTrade> {
  const openTime = tradeData.openTime ? new Date(tradeData.openTime) : new Date();
  const closeTime = tradeData.closeTime ? new Date(tradeData.closeTime) : new Date(openTime);
  const pair = (tradeData.pair || "CATATAN").toUpperCase();

  let netPnL = tradeData.netPnL !== undefined ? Number(tradeData.netPnL) : 0;
  if (tradeData.netPnL === undefined && tradeData.entryPrice) {
    const exitPrice = tradeData.exitPrice || tradeData.entryPrice;
    const dir = tradeData.direction || "BUY";
    const netPips = calculatePips(pair, tradeData.entryPrice, exitPrice, dir);
    const pipValue = pair.includes("XAU") ? 1.0 : pair.includes("JPY") ? 6.5 : 10.0;
    const grossPnL = netPips * (tradeData.lotSize || 1.0) * pipValue;
    netPnL = Number(grossPnL.toFixed(2));
  }

  let status: "WIN" | "LOSS" | "BREAK_EVEN" = "BREAK_EVEN";
  if (netPnL > 0) status = "WIN";
  else if (netPnL < 0) status = "LOSS";

  const clientTrade: SampleTrade = {
    id: `trade-${Date.now()}`,
    accountId: tradeData.accountId || "default-account",
    ticketId: `${Math.floor(10000000 + Math.random() * 90000000)}`,
    pair,
    direction: tradeData.direction || (netPnL >= 0 ? "BUY" : "SELL"),
    session: detectTradingSession(openTime),
    openTime: openTime.toISOString(),
    closeTime: closeTime.toISOString(),
    lotSize: tradeData.lotSize || 1.0,
    entryPrice: tradeData.entryPrice || 0,
    exitPrice: tradeData.exitPrice || 0,
    stopLoss: tradeData.stopLoss || 0,
    takeProfit: tradeData.takeProfit || 0,
    netPnL,
    netPips: tradeData.netPips || 0,
    riskRewardRatio: tradeData.riskRewardRatio || 0,
    status,
    strategyName: tradeData.strategyName || "Catatan Transaksi",
    emotionTag: tradeData.emotionTag,
    mistakeTag: tradeData.mistakeTag,
    notes: tradeData.notes,
    isNewsTrade: tradeData.isNewsTrade || false,
  };

  try {
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tradeData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.trade) return data.trade;
    }
  } catch (e) {
    console.warn("POST /api/trades failed, using local trade state:", e);
  }

  return clientTrade;
}

export async function deleteTradeClient(tradeId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/trades?id=${tradeId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn("DELETE /api/trades failed:", e);
  }
  return false;
}

