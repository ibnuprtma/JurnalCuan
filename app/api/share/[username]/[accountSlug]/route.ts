import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string; accountSlug: string }> }
) {
  try {
    const { username, accountSlug } = await context.params;

    if (!username || !accountSlug) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    // 1. Cari user berdasarkan username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { username: username },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan", notFound: true }, { status: 404 });
    }

    // 2. Cari akun berdasarkan publicSlug
    const account = await prisma.tradingAccount.findFirst({
      where: {
        userId: user.id,
        publicSlug: accountSlug,
      },
      include: {
        trades: {
          orderBy: { openTime: "desc" },
          include: { strategy: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Akun portofolio tidak ditemukan", notFound: true }, { status: 404 });
    }

    // 3. Cek apakah akun diatur sebagai publik atau privat
    if (!account.isPublic) {
      return NextResponse.json({
        isPublic: false,
        accountName: account.name,
        broker: account.broker,
        user: {
          name: user.name,
          username: user.username,
        },
      });
    }

    // 4. Jika publik, kembalikan data statistik & riwayat transaksi
    return NextResponse.json({
      isPublic: true,
      user: {
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      account: {
        id: account.id,
        name: account.name,
        broker: account.broker,
        accountType: account.accountType,
        currentBalance: Number(account.currentBalance),
        initialBalance: Number(account.initialBalance),
        currency: account.currency,
        hideDollarAmounts: account.hideDollarAmounts,
        hideOpenTrades: account.hideOpenTrades,
        publicSlug: account.publicSlug,
      },
      trades: account.trades.map((t) => ({
        id: t.id,
        accountId: t.accountId,
        ticketId: t.ticketId || t.id.slice(0, 8),
        pair: t.pair,
        direction: t.direction,
        session: t.session,
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
        status: t.status,
        strategyName: t.strategy?.name || "Price Action",
        emotionTag: t.emotionTag || undefined,
        mistakeTag: t.mistakeTag || undefined,
        notes: t.notes || undefined,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/share error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
