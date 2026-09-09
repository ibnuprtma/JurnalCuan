import { NextRequest, NextResponse } from "next/server";
import { getAllTrades, createNewTrade } from "@/lib/trades-service";
import { getCurrentUser } from "@/lib/auth-user";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = req.nextUrl.searchParams.get("accountId") || undefined;
    const trades = await getAllTrades(accountId, user.id);
    return NextResponse.json({ trades });
  } catch (error: any) {
    console.error("GET /api/trades error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const trade = await createNewTrade(body, user.id);
    return NextResponse.json({ trade, success: true });
  } catch (error: any) {
    console.error("POST /api/trades error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tradeId = req.nextUrl.searchParams.get("id");
    if (!tradeId) {
      try {
        const body = await req.json();
        tradeId = body.id;
      } catch {
        // No body
      }
    }

    if (!tradeId) {
      return NextResponse.json({ error: "ID transaksi wajib disertakan" }, { status: 400 });
    }

    const { deleteTrade } = await import("@/lib/trades-service");
    const success = await deleteTrade(tradeId, user.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("DELETE /api/trades error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
