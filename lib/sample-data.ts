export interface SampleTrade {
  id: string;
  accountId: string;
  ticketId: string;
  pair: string;
  direction: "BUY" | "SELL";
  session: "ASIAN" | "LONDON" | "NEW_YORK" | "OVERLAP" | "OTHER";
  openTime: string; // ISO string
  closeTime: string; // ISO string
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  netPnL: number;
  netPips: number;
  riskRewardRatio: number;
  status: "WIN" | "LOSS" | "BREAK_EVEN" | "OPEN";
  strategyName: string;
  emotionTag?: string;
  mistakeTag?: string;
  isNewsTrade?: boolean;
  notes?: string;
}

// Generate realistic forex trades for current and recent months
export function generateSampleTrades(): SampleTrade[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const trades: SampleTrade[] = [
    // Today trades
    {
      id: "trade-1",
      accountId: "demo-account-1",
      ticketId: "89203112",
      pair: "XAUUSD",
      direction: "BUY",
      session: "LONDON",
      openTime: new Date(currentYear, currentMonth, now.getDate(), 8, 30).toISOString(),
      closeTime: new Date(currentYear, currentMonth, now.getDate(), 11, 45).toISOString(),
      lotSize: 0.5,
      entryPrice: 2480.50,
      exitPrice: 2492.80,
      stopLoss: 2474.00,
      takeProfit: 2495.00,
      netPnL: 615.00,
      netPips: 123.0,
      riskRewardRatio: 1.89,
      status: "WIN",
      strategyName: "SMC / Order Block",
      emotionTag: "Disciplined",
      notes: "Clean rejection on 15m bullish order block after Asian liquidity sweep.",
    },
    {
      id: "trade-2",
      accountId: "demo-account-1",
      ticketId: "89203891",
      pair: "EURUSD",
      direction: "SELL",
      session: "OVERLAP",
      openTime: new Date(currentYear, currentMonth, now.getDate(), 13, 10).toISOString(),
      closeTime: new Date(currentYear, currentMonth, now.getDate(), 15, 20).toISOString(),
      lotSize: 1.0,
      entryPrice: 1.08850,
      exitPrice: 1.08620,
      stopLoss: 1.08980,
      takeProfit: 1.08500,
      netPnL: 230.00,
      netPips: 23.0,
      riskRewardRatio: 1.77,
      status: "WIN",
      strategyName: "Supply & Demand Breakout",
      emotionTag: "Patient",
      notes: "Bearish retest on London high break.",
    },
    // Yesterday trades
    {
      id: "trade-3",
      accountId: "demo-account-1",
      ticketId: "89194200",
      pair: "GBPJPY",
      direction: "BUY",
      session: "LONDON",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 1), 9, 0).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 1), 12, 10).toISOString(),
      lotSize: 0.8,
      entryPrice: 194.200,
      exitPrice: 194.750,
      stopLoss: 193.900,
      takeProfit: 195.000,
      netPnL: 385.00,
      netPips: 55.0,
      riskRewardRatio: 1.83,
      status: "WIN",
      strategyName: "London Breakout",
      emotionTag: "Confident",
      notes: "Tokyo high breakout during London open impulse.",
    },
    // 2 days ago (Loss day)
    {
      id: "trade-4",
      accountId: "demo-account-1",
      ticketId: "89182310",
      pair: "XAUUSD",
      direction: "SELL",
      session: "NEW_YORK",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 2), 16, 30).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 2), 17, 15).toISOString(),
      lotSize: 0.5,
      entryPrice: 2470.00,
      exitPrice: 2474.50,
      stopLoss: 2474.50,
      takeProfit: 2458.00,
      netPnL: -225.00,
      netPips: -45.0,
      riskRewardRatio: -1.00,
      status: "LOSS",
      strategyName: "Support & Resistance Retest",
      emotionTag: "FOMO",
      mistakeTag: "Late Entry",
      notes: "Entered too late after momentum candle already stretched.",
    },
    // 3 days ago
    {
      id: "trade-5",
      accountId: "demo-account-1",
      ticketId: "89171290",
      pair: "USDJPY",
      direction: "BUY",
      session: "ASIAN",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 3), 2, 0).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 3), 6, 30).toISOString(),
      lotSize: 1.0,
      entryPrice: 154.300,
      exitPrice: 154.820,
      stopLoss: 154.050,
      takeProfit: 155.000,
      netPnL: 340.00,
      netPips: 52.0,
      riskRewardRatio: 2.08,
      status: "WIN",
      strategyName: "Trend Following Pullback",
      emotionTag: "Disciplined",
    },
    // 4 days ago
    {
      id: "trade-6",
      accountId: "demo-account-1",
      ticketId: "89163011",
      pair: "EURUSD",
      direction: "BUY",
      session: "LONDON",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 4), 8, 45).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 4), 10, 15).toISOString(),
      lotSize: 1.0,
      entryPrice: 1.08200,
      exitPrice: 1.08480,
      stopLoss: 1.08050,
      takeProfit: 1.08600,
      netPnL: 280.00,
      netPips: 28.0,
      riskRewardRatio: 1.87,
      status: "WIN",
      strategyName: "SMC / Order Block",
      emotionTag: "Patient",
    },
    // 5 days ago (Loss trade)
    {
      id: "trade-7",
      accountId: "demo-account-1",
      ticketId: "89152002",
      pair: "GBPJPY",
      direction: "SELL",
      session: "NEW_YORK",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 5), 14, 0).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 5), 15, 30).toISOString(),
      lotSize: 0.6,
      entryPrice: 195.100,
      exitPrice: 195.450,
      stopLoss: 195.450,
      takeProfit: 194.200,
      netPnL: -160.00,
      netPips: -35.0,
      riskRewardRatio: -1.00,
      status: "LOSS",
      strategyName: "London Breakout",
      emotionTag: "Hesitant",
    },
    // 6 days ago (Big Gold Profit)
    {
      id: "trade-8",
      accountId: "demo-account-1",
      ticketId: "89141990",
      pair: "XAUUSD",
      direction: "BUY",
      session: "OVERLAP",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 6), 13, 30).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 6), 18, 0).toISOString(),
      lotSize: 0.7,
      entryPrice: 2455.00,
      exitPrice: 2472.50,
      stopLoss: 2448.00,
      takeProfit: 2475.00,
      netPnL: 1225.00,
      netPips: 175.0,
      riskRewardRatio: 2.50,
      status: "WIN",
      strategyName: "SMC / Order Block",
      emotionTag: "Disciplined",
      isNewsTrade: true,
      notes: "US CPI news event release momentum follow through.",
    },
    // 7 days ago (Break Even)
    {
      id: "trade-9",
      accountId: "demo-account-1",
      ticketId: "89130881",
      pair: "EURUSD",
      direction: "SELL",
      session: "LONDON",
      openTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 7), 9, 15).toISOString(),
      closeTime: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 7), 11, 0).toISOString(),
      lotSize: 1.0,
      entryPrice: 1.08600,
      exitPrice: 1.08600,
      stopLoss: 1.08750,
      takeProfit: 1.08200,
      netPnL: 0.00,
      netPips: 0.0,
      riskRewardRatio: 0.00,
      status: "BREAK_EVEN",
      strategyName: "Supply & Demand Breakout",
      emotionTag: "Disciplined",
      mistakeTag: "Moved SL early",
      notes: "Moved stop loss to entry price early, hit BE before target.",
    },
  ];

  return trades;
}
