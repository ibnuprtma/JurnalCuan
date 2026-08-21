import { prisma } from "./prisma";
import { SampleTrade } from "./sample-data";
import { calculatePips, calculateRiskReward, detectTradingSession } from "./forex-utils";

// Clean memory storage fallback
let inMemoryTrades: SampleTrade[] = [];

async function getOrCreateDefaultUserId(): Promise<string> {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        auth0Id: `local_${Date.now()}`,
        email: "trader@jurnalcuan.local",
        name: "Trader",
        username: "trader",
      },
    });
  }
  return user.id;
}

export async function getAccounts(userId?: string) {
  try {
    const dbAccounts = await prisma.tradingAccount.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "asc" },
    });

    if (dbAccounts.length > 0) {
      return dbAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        broker: a.broker || "-",
        accountType: a.accountType,
        currentBalance: Number(a.currentBalance),
        currency: a.currency,
        isPublic: a.isPublic,
        publicSlug: a.publicSlug,
      }));
    }

    // If database is empty for this user, auto-create 1 clean default Demo account linked to user with broker "-"
    const ownerId = userId || (await getOrCreateDefaultUserId());
    const newDefault = await prisma.tradingAccount.create({
      data: {
        userId: ownerId,
        name: "Personal Demo Account",
        broker: "-",
        accountType: "Demo",
        initialBalance: 10000,
        currentBalance: 10000,
        currency: "USD",
        isPublic: false,
        publicSlug: "personal-demo",
      },
    });

    return [
      {
        id: newDefault.id,
        name: newDefault.name,
        broker: newDefault.broker || "-",
        accountType: newDefault.accountType,
        currentBalance: Number(newDefault.currentBalance),
        currency: newDefault.currency,
        isPublic: newDefault.isPublic,
        publicSlug: newDefault.publicSlug,
      },
    ];
  } catch (e) {
    console.warn("DB getAccounts query info:", e);
  }

  return [
    {
      id: "default-account",
      name: "Personal Demo Account",
      broker: "-",
      accountType: "Demo",
      currentBalance: 10000,
      currency: "USD",
      isPublic: false,
      publicSlug: "personal-demo",
    },
  ];
}

export async function getAllTrades(accountId?: string, userId?: string): Promise<SampleTrade[]> {
  try {
    const whereClause: any = {};

    if (userId) {
      const userAccounts = await prisma.tradingAccount.findMany({
        where: { userId },
        select: { id: true },
      });
      const userAccountIds = userAccounts.map((a) => a.id);

      if (userAccountIds.length === 0) {
        return [];
      }

      if (accountId && accountId !== "all") {
        if (!userAccountIds.includes(accountId)) {
          return []; // Account does not belong to this user
        }
        whereClause.accountId = accountId;
      } else {
        whereClause.accountId = { in: userAccountIds };
      }
    } else if (accountId && accountId !== "all") {
      whereClause.accountId = accountId;
    }

    const dbTrades = await prisma.trade.findMany({
      where: whereClause,
      include: {
        strategy: true,
      },
      orderBy: { openTime: "desc" },
    });

    return dbTrades.map((t) => ({
      id: t.id,
      accountId: t.accountId,
      ticketId: t.ticketId || t.id.slice(0, 8),
      pair: t.pair,
      direction: t.direction as "BUY" | "SELL",
      session: t.session as any,
      openTime: t.openTime.toISOString(),
      closeTime: t.closeTime ? t.closeTime.toISOString() : t.openTime.toISOString(),
      lotSize: Number(t.lotSize),
      entryPrice: Number(t.entryPrice),
      exitPrice: Number(t.exitPrice || t.entryPrice),
      stopLoss: Number(t.stopLoss || 0),
      takeProfit: Number(t.takeProfit || 0),
      netPnL: Number(t.netPnL || 0),
      netPips: Number(t.netPips || 0),
      riskRewardRatio: Number(t.riskRewardRatio || 0),
      status: t.status as any,
      strategyName: t.strategy?.name || "Standard Setup",
      emotionTag: t.emotionTag || undefined,
      mistakeTag: t.mistakeTag || undefined,
      isNewsTrade: t.isNewsTrade,
      notes: t.notes || undefined,
    }));
  } catch (e) {
    console.warn("DB getAllTrades query info:", e);
  }

  if (accountId && accountId !== "all") {
    return inMemoryTrades.filter((t) => t.accountId === accountId);
  }
  return inMemoryTrades;
}

export async function createNewTrade(
  tradeData: {
    accountId: string;
    pair: string;
    direction: "BUY" | "SELL";
    lotSize: number;
    entryPrice: number;
    exitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    openTime?: string;
    closeTime?: string;
    strategyName?: string;
    emotionTag?: string;
    mistakeTag?: string;
    notes?: string;
    isNewsTrade?: boolean;
    commission?: number;
    swap?: number;
  },
  userId?: string
) {
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
  const commission = tradeData.commission || 0;
  const swap = tradeData.swap || 0;
  const netPnL = Number((grossPnL - commission + swap).toFixed(2));

  let status: "WIN" | "LOSS" | "BREAK_EVEN" = "BREAK_EVEN";
  if (netPnL > 0) status = "WIN";
  else if (netPnL < 0) status = "LOSS";

  // Ensure account belongs to user in DB
  let targetAccountId = tradeData.accountId;
  try {
    let account = null;

    if (targetAccountId && targetAccountId !== "all" && targetAccountId !== "demo-account-1") {
      account = await prisma.tradingAccount.findFirst({
        where: {
          id: targetAccountId,
          ...(userId ? { userId } : {}),
        },
      });
    }

    // If account was not found or was invalid, fallback to user's first account
    if (!account) {
      account = await prisma.tradingAccount.findFirst({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: "asc" },
      });

      if (!account) {
        const ownerId = userId || (await getOrCreateDefaultUserId());
        account = await prisma.tradingAccount.create({
          data: {
            userId: ownerId,
            name: "Personal Demo Account",
            broker: "-",
            accountType: "Demo",
            initialBalance: 10000,
            currentBalance: 10000,
            currency: "USD",
          },
        });
      }
    }

    targetAccountId = account.id;

    const created = await prisma.trade.create({
      data: {
        accountId: targetAccountId,
        ticketId: `${Math.floor(10000000 + Math.random() * 90000000)}`,
        pair: tradeData.pair.toUpperCase(),
        direction: tradeData.direction,
        session,
        openTime,
        closeTime,
        lotSize: tradeData.lotSize,
        entryPrice: tradeData.entryPrice,
        exitPrice,
        stopLoss: tradeData.stopLoss || 0,
        takeProfit: tradeData.takeProfit || 0,
        netPnL,
        netPips,
        riskRewardRatio: realizedRR || plannedRR || 0,
        status,
        emotionTag: tradeData.emotionTag,
        mistakeTag: tradeData.mistakeTag,
        notes: tradeData.notes,
        isNewsTrade: tradeData.isNewsTrade || false,
      },
    });

    return {
      id: created.id,
      accountId: created.accountId,
      ticketId: created.ticketId || created.id.slice(0, 8),
      pair: created.pair,
      direction: created.direction as "BUY" | "SELL",
      session: created.session as any,
      openTime: created.openTime.toISOString(),
      closeTime: created.closeTime ? created.closeTime.toISOString() : created.openTime.toISOString(),
      lotSize: Number(created.lotSize),
      entryPrice: Number(created.entryPrice),
      exitPrice: Number(created.exitPrice || created.entryPrice),
      stopLoss: Number(created.stopLoss || 0),
      takeProfit: Number(created.takeProfit || 0),
      netPnL: Number(created.netPnL || 0),
      netPips: Number(created.netPips || 0),
      riskRewardRatio: Number(created.riskRewardRatio || 0),
      status: created.status as any,
      strategyName: tradeData.strategyName || "SMC / Order Block",
      emotionTag: created.emotionTag || undefined,
      mistakeTag: created.mistakeTag || undefined,
      notes: created.notes || undefined,
      isNewsTrade: created.isNewsTrade,
    };
  } catch (e) {
    console.warn("Prisma create trade fallback:", e);
  }

  const fallbackTrade: SampleTrade = {
    id: `trade-${Date.now()}`,
    accountId: targetAccountId || "default-account",
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

  inMemoryTrades = [fallbackTrade, ...inMemoryTrades];
  return fallbackTrade;
}
