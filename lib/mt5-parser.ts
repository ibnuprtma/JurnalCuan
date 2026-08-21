import { SampleTrade } from "./sample-data";
import { calculatePips } from "./forex-utils";

export function parseMT5Report(htmlOrCsvText: string, accountId: string): SampleTrade[] {
  const importedTrades: SampleTrade[] = [];
  const lines = htmlOrCsvText.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/(XAUUSD|EURUSD|GBPUSD|USDJPY|GBPJPY|AUDUSD|USDCAD|BTCUSD|US30)/i);
    const hasBuySell = /buy|sell/i.test(line);

    if (match && hasBuySell) {
      const pair = match[1].toUpperCase();
      const direction: "BUY" | "SELL" = /sell/i.test(line) ? "SELL" : "BUY";

      const numbers = line.match(/[-+]?\d+(\.\d+)?/g);
      if (numbers && numbers.length >= 4) {
        const ticketId = numbers[0] || `${Math.floor(10000000 + Math.random() * 90000000)}`;
        const lotSize = parseFloat(numbers[1]) || 0.1;
        const entryPrice = parseFloat(numbers[2]) || 1.0;
        const exitPrice = parseFloat(numbers[3]) || entryPrice;
        const pnlGuess = parseFloat(numbers[numbers.length - 1]) || 0;

        const netPips = calculatePips(pair, entryPrice, exitPrice, direction);
        const status = pnlGuess > 0 ? "WIN" : pnlGuess < 0 ? "LOSS" : "BREAK_EVEN";

        const trade: SampleTrade = {
          id: `mt5-${ticketId}`,
          accountId,
          ticketId,
          pair,
          direction,
          session: "LONDON",
          openTime: new Date().toISOString(),
          closeTime: new Date().toISOString(),
          lotSize,
          entryPrice,
          exitPrice,
          stopLoss: 0,
          takeProfit: 0,
          netPnL: pnlGuess,
          netPips,
          riskRewardRatio: 1.5,
          status,
          strategyName: "MT5 Imported",
        };

        importedTrades.push(trade);
      }
    }
  }

  return importedTrades;
}
