import { NextRequest, NextResponse } from "next/server";
import { getAccounts } from "@/lib/trades-service";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const accounts = await getAccounts(user?.id);
    return NextResponse.json({ accounts, user: user || null });
  } catch (error: any) {
    console.error("GET /api/accounts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const body = await req.json();
    const { name, broker, accountNumber, accountType, initialBalance, currency } = body;

    // Validasi input
    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: "Nama akun minimal 3 karakter" }, { status: 400 });
    }
    if (!accountType || !["Demo", "Real", "PropFirm"].includes(accountType)) {
      return NextResponse.json({ error: "Tipe akun tidak valid" }, { status: 400 });
    }

    // Buat slug unik dari nama akun
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);

    // Pastikan slug unik per user
    let slug = baseSlug;
    let slugSuffix = 1;
    while (true) {
      const existing = await prisma.tradingAccount.findFirst({
        where: { userId: user.id, publicSlug: slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${slugSuffix++}`;
    }

    const balance = parseFloat(initialBalance) || 0;

    const newAccount = await prisma.tradingAccount.create({
      data: {
        userId: user.id,
        name: name.trim(),
        broker: broker?.trim() || null,
        accountNumber: accountNumber?.trim() || null,
        accountType,
        initialBalance: balance,
        currentBalance: balance,
        currency: currency || "USD",
        isPublic: false,
        publicSlug: slug,
      },
    });

    return NextResponse.json({
      account: {
        id: newAccount.id,
        name: newAccount.name,
        broker: newAccount.broker,
        accountType: newAccount.accountType,
        currentBalance: Number(newAccount.currentBalance),
        initialBalance: Number(newAccount.initialBalance),
        currency: newAccount.currency,
        publicSlug: newAccount.publicSlug,
        isPublic: newAccount.isPublic,
      },
    });
  } catch (error: any) {
    console.error("POST /api/accounts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
