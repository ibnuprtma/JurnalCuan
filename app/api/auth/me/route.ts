import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
