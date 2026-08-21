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
