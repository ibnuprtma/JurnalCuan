import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, currency, timezone } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: name.trim(),
        bio: bio !== undefined ? bio : undefined,
        currency: currency || undefined,
        timezone: timezone || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        auth0Id: updatedUser.auth0Id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatarUrl,
        currency: updatedUser.currency,
        timezone: updatedUser.timezone,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
