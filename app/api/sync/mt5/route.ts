import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePips, calculateRiskReward, detectTradingSession } from "@/lib/forex-utils";

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key diperlukan untuk otorisasi webhook MT5." },
        { status: 401 }
      );
    }

    // Find account by syncApiKey or use default
    let account = await prisma.tradingAccount.findFirst({
      where: { syncApiKey: apiKey },
    });

    if (!account) {
      // Fallback to first active account
      account = await prisma.tradingAccount.findFirst();
    }

    if (!account) {
      return NextResponse.json(
        { error: "Akun trading tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      ticket,
      symbol,
      type, // "BUY" or "SELL" or 0 / 1
      lots,
      open_price,
      close_price,
      open_time,
      close_time,
      sl,
      tp,
      profit,
      commission,
      swap,
      comment,
    } = body;

    const pair = (symbol || "XAUUSD").toUpperCase();
    const direction: "BUY" | "SELL" =
      type === 1 || type === "SELL" || type === "sell" ? "SELL" : "BUY";
    const ticketId = String(ticket || Date.now());

    const openDateTime = open_time ? new Date(open_time) : new Date();
    const closeDateTime = close_time ? new Date(close_time) : new Date();
    const session = detectTradingSession(openDateTime);

    const entryPrice = parseFloat(open_price) || 1.0;
    const exitPrice = parseFloat(close_price) || entryPrice;
    const lotSize = parseFloat(lots) || 0.1;
    const stopLoss = parseFloat(sl) || 0;
    const takeProfit = parseFloat(tp) || 0;
    const netPnL = parseFloat(profit) || 0;

    const netPips = calculatePips(pair, entryPrice, exitPrice, direction);
    const { plannedRR, realizedRR } = calculateRiskReward(entryPrice, exitPrice, stopLoss, takeProfit, direction);

    const status = netPnL > 0 ? "WIN" : netPnL < 0 ? "LOSS" : "BREAK_EVEN";

    // Idempotent UPSERT into Database based on [accountId, ticketId]
    const upsertedTrade = await prisma.trade.upsert({
      where: {
        accountId_ticketId: {
          accountId: account.id,
          ticketId,
        },
      },
      update: {
        exitPrice,
        closeTime: closeDateTime,
        netPnL,
        netPips,
        riskRewardRatio: realizedRR || plannedRR || 0,
        status,
        commission: parseFloat(commission) || 0,
        swap: parseFloat(swap) || 0,
        syncSource: "MT5_WEBHOOK",
      },
      create: {
        accountId: account.id,
        ticketId,
        pair,
        direction,
        session,
        openTime: openDateTime,
        closeTime: closeDateTime,
        lotSize,
        entryPrice,
        exitPrice,
        stopLoss,
        takeProfit,
        netPnL,
        netPips,
        riskRewardRatio: realizedRR || plannedRR || 0,
        status,
        commission: parseFloat(commission) || 0,
        swap: parseFloat(swap) || 0,
        syncSource: "MT5_WEBHOOK",
        notes: comment || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi MT5 berhasil disinkronkan ke Jurnal Cuan!",
      tradeId: upsertedTrade.id,
      ticketId,
    });
  } catch (error: any) {
    console.error("Error MT5 webhook sync:", error);
    return NextResponse.json(
      { error: "Gagal memproses webhook MT5", details: error.message },
      { status: 500 }
    );
  }
}
