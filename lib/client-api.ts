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
  const closeTime = tradeData.closeTime ? new Date(tradeData.closeTime) : new Date();
  const exitPrice = tradeData.exitPrice || tradeData.entryPrice;
  const session = detectTradingSession(openTime);

  const netPips = calculatePips(tradeData.pair, tradeData.entryPrice, exitPrice, tradeData.direction);
  const { plannedRR, realizedRR } = calculateRiskReward(
    tradeData.entryPrice,
    exitPrice,
    tradeData.stopLoss,
    tradeData.takeProfit,
    tradeData.direction
  );

  const pipValue = tradeData.pair.includes("XAU") ? 1.0 : tradeData.pair.includes("JPY") ? 6.5 : 10.0;
  const grossPnL = netPips * tradeData.lotSize * pipValue;
  const netPnL = Number(grossPnL.toFixed(2));

  let status: "WIN" | "LOSS" | "BREAK_EVEN" = "BREAK_EVEN";
  if (netPnL > 0) status = "WIN";
  else if (netPnL < 0) status = "LOSS";

  const clientTrade: SampleTrade = {
    id: `trade-${Date.now()}`,
    accountId: tradeData.accountId || "default-account",
    ticketId: `${Math.floor(10000000 + Math.random() * 90000000)}`,
    pair: tradeData.pair.toUpperCase(),
    direction: tradeData.direction,
    session,
    openTime: openTime.toISOString(),
    closeTime: closeTime.toISOString(),
    lotSize: tradeData.lotSize,
    entryPrice: tradeData.entryPrice,
    exitPrice,
    stopLoss: tradeData.stopLoss || 0,
    takeProfit: tradeData.takeProfit || 0,
    netPnL,
    netPips,
    riskRewardRatio: realizedRR || plannedRR || 0,
    status,
    strategyName: tradeData.strategyName || "SMC / Order Block",
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
