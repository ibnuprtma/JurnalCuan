import { SampleTrade } from "./sample-data";
import { formatCurrency, formatSignedCurrency, getCurrencySymbol } from "./utils";

export interface CurrencyPortfolioGroup {
  currency: string;
  initialBalance: number;
  currentBalance: number;
  netPnL: number;
  grossProfit: number;
  grossLoss: number;
  pctGain: number; // e.g. 5.25 for +5.25%
  winningCount: number;
  losingCount: number;
  tradeCount: number;
  accountNames: string[];
}

export interface AccountTypeGroup {
  type: string; // "Real" | "Prop Firm" | "Demo" | "Other"
  count: number;
  tradeCount: number;
  accountNames: string[];
}

export interface PortfolioStats {
  isAllSelected: boolean;
  isMultiCurrency: boolean;
  currencies: string[];
  currencyGroups: CurrencyPortfolioGroup[];
  accountTypeGroups: AccountTypeGroup[];
  totalTradesCount: number;
  overallWeightedROI: number;
  singleCurrencyStats?: {
    netPnL: number;
    grossProfit: number;
    grossLoss: number;
    pctGain: number;
    initialBalance: number;
    currentBalance: number;
    currency: string;
    totalTrades: number;
    winningCount: number;
    losingCount: number;
  };
}

/**
 * Format compact currency for small chips and calendar cells (e.g. "+Rp 50rb", "+$1.2k")
 */
export function formatCompactCurrency(
  amount: number | null | undefined,
  currency: string = "USD",
  signed: boolean = true
): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return currency.toUpperCase() === "IDR" ? "Rp 0" : `${getCurrencySymbol(currency)}0`;
  }

  const cur = currency.toUpperCase();
  const abs = Math.abs(amount);
  const isNeg = amount < 0;
  const sign = signed ? (isNeg ? "-" : "+") : isNeg ? "-" : "";

  if (cur === "IDR") {
    if (abs >= 1_000_000_000) {
      return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}B`;
    }
    if (abs >= 1_000_000) {
      const val = (abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1);
      return `${sign}Rp ${val}jt`;
    }
    if (abs >= 1_000) {
      const val = (abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 0);
      return `${sign}Rp ${val}rb`;
    }
    return `${sign}Rp ${Math.round(abs)}`;
  }

  const sym = getCurrencySymbol(cur);
  if (abs >= 1_000_000) {
    return `${sign}${sym}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${sym}${(abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}k`;
  }
  return `${sign}${sym}${abs.toFixed(abs % 1 === 0 ? 0 : 2)}`;
}

/**
 * Compute portfolio statistics for single account or all accounts (multi-currency aware)
 */
export function computePortfolioStats(
  accounts: any[],
  trades: SampleTrade[],
  selectedAccountId: string,
  typeFilter: string = "ALL",
  currencyFilter: string = "ALL"
): PortfolioStats {
  const isAll = !selectedAccountId || selectedAccountId === "all";

  // Filter accounts by type and currency if specified
  let targetAccounts = [...accounts];

  if (!isAll) {
    targetAccounts = accounts.filter((a) => a.id === selectedAccountId);
    if (targetAccounts.length === 0 && accounts.length > 0) {
      targetAccounts = [accounts[0]];
    }
  } else {
    if (typeFilter !== "ALL") {
      targetAccounts = targetAccounts.filter(
        (a) => (a.accountType || "Real").toLowerCase() === typeFilter.toLowerCase()
      );
    }
    if (currencyFilter !== "ALL") {
      targetAccounts = targetAccounts.filter(
        (a) => (a.currency || "USD").toUpperCase() === currencyFilter.toUpperCase()
      );
    }
  }

  const targetAccountIds = new Set(targetAccounts.map((a) => a.id));

  // Relevant trades
  const targetTrades = trades.filter((t) => {
    if (!isAll) return t.accountId === targetAccounts[0]?.id;
    return targetAccountIds.has(t.accountId);
  });

  // Distinct currencies
  const currencySet = new Set(targetAccounts.map((a) => (a.currency || "USD").toUpperCase()));
  const currencies = Array.from(currencySet);
  const isMultiCurrency = currencies.length > 1;

  // Single account or single currency view
  if (!isMultiCurrency) {
    const singleCurrency = currencies[0] || "USD";
    const initialBalance = targetAccounts.reduce(
      (sum, a) => sum + (Number(a.initialBalance || a.currentBalance) || 0),
      0
    );
    const currentBalance = targetAccounts.reduce(
      (sum, a) => sum + (Number(a.currentBalance) || 0),
      0
    );
    const netPnL = targetTrades.reduce((sum, t) => sum + t.netPnL, 0);
    const winningTrades = targetTrades.filter((t) => t.netPnL > 0);
    const losingTrades = targetTrades.filter((t) => t.netPnL < 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.netPnL, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.netPnL, 0));
    const pctGain = initialBalance > 0 ? (netPnL / initialBalance) * 100 : 0;

    return {
      isAllSelected: isAll,
      isMultiCurrency: false,
      currencies: [singleCurrency],
      currencyGroups: [
        {
          currency: singleCurrency,
          initialBalance,
          currentBalance,
          netPnL,
          grossProfit,
          grossLoss,
          pctGain,
          winningCount: winningTrades.length,
          losingCount: losingTrades.length,
          tradeCount: targetTrades.length,
          accountNames: targetAccounts.map((a) => a.name),
        },
      ],
      accountTypeGroups: [
        {
          type: targetAccounts[0]?.accountType || "Real",
          count: targetAccounts.length,
          tradeCount: targetTrades.length,
          accountNames: targetAccounts.map((a) => a.name),
        },
      ],
      totalTradesCount: targetTrades.length,
      overallWeightedROI: pctGain,
      singleCurrencyStats: {
        netPnL,
        grossProfit,
        grossLoss,
        pctGain,
        initialBalance,
        currentBalance,
        currency: singleCurrency,
        totalTrades: targetTrades.length,
        winningCount: winningTrades.length,
        losingCount: losingTrades.length,
      },
    };
  }

  // Multi-currency calculation
  const currencyGroups: CurrencyPortfolioGroup[] = currencies.map((curr) => {
    const currAccounts = targetAccounts.filter(
      (a) => (a.currency || "USD").toUpperCase() === curr
    );
    const currAccountIds = new Set(currAccounts.map((a) => a.id));
    const currTrades = targetTrades.filter((t) => currAccountIds.has(t.accountId));

    const initialBalance = currAccounts.reduce(
      (sum, a) => sum + (Number(a.initialBalance || a.currentBalance) || 0),
      0
    );
    const currentBalance = currAccounts.reduce(
      (sum, a) => sum + (Number(a.currentBalance) || 0),
      0
    );
    const netPnL = currTrades.reduce((sum, t) => sum + t.netPnL, 0);
    const winning = currTrades.filter((t) => t.netPnL > 0);
    const losing = currTrades.filter((t) => t.netPnL < 0);
    const grossProfit = winning.reduce((sum, t) => sum + t.netPnL, 0);
    const grossLoss = Math.abs(losing.reduce((sum, t) => sum + t.netPnL, 0));
    const pctGain = initialBalance > 0 ? (netPnL / initialBalance) * 100 : 0;

    return {
      currency: curr,
      initialBalance,
      currentBalance,
      netPnL,
      grossProfit,
      grossLoss,
      pctGain,
      winningCount: winning.length,
      losingCount: losing.length,
      tradeCount: currTrades.length,
      accountNames: currAccounts.map((a) => a.name),
    };
  });

  // Account Type Groups
  const typeMap = new Map<string, { count: number; tradeCount: number; names: string[] }>();
  targetAccounts.forEach((acc) => {
    const type = acc.accountType || "Real";
    const existing = typeMap.get(type) || { count: 0, tradeCount: 0, names: [] };
    existing.count += 1;
    existing.names.push(acc.name);
    const accTrades = targetTrades.filter((t) => t.accountId === acc.id);
    existing.tradeCount += accTrades.length;
    typeMap.set(type, existing);
  });

  const accountTypeGroups: AccountTypeGroup[] = Array.from(typeMap.entries()).map(
    ([type, data]) => ({
      type,
      count: data.count,
      tradeCount: data.tradeCount,
      accountNames: data.names,
    })
  );

  // Overall Weighted ROI: average of ROI % across active accounts
  let totalWeightedRoi = 0;
  let activeAccountCount = 0;

  targetAccounts.forEach((acc) => {
    const accInitial = Number(acc.initialBalance || acc.currentBalance) || 0;
    const accTrades = targetTrades.filter((t) => t.accountId === acc.id);
    const accPnL = accTrades.reduce((sum, t) => sum + t.netPnL, 0);
    if (accInitial > 0) {
      totalWeightedRoi += (accPnL / accInitial) * 100;
      activeAccountCount++;
    }
  });

  const overallWeightedROI = activeAccountCount > 0 ? totalWeightedRoi / activeAccountCount : 0;

  return {
    isAllSelected: isAll,
    isMultiCurrency: true,
    currencies,
    currencyGroups,
    accountTypeGroups,
    totalTradesCount: targetTrades.length,
    overallWeightedROI,
  };
}
