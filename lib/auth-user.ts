import { auth0 } from "./auth0";
import { prisma } from "./prisma";

export interface AuthenticatedTrader {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  accounts: {
    id: string;
    name: string;
    broker: string | null;
    accountType: string | null;
    currentBalance: number;
    currency: string;
    isPublic: boolean;
    publicSlug: string | null;
  }[];
}

/**
 * Get currently authenticated user from Auth0 session and sync/upsert in PostgreSQL
 */
export async function getCurrentUser(): Promise<AuthenticatedTrader | null> {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return null;
    }

    const auth0User = session.user;
    const auth0Id = auth0User.sub as string;
    const email = (auth0User.email as string) || `${auth0Id}@auth0.user`;
    const name = (auth0User.name as string) || (auth0User.nickname as string) || "Trader";
    const avatarUrl = (auth0User.picture as string) || null;
    const username = (auth0User.nickname as string) || `user_${auth0Id.slice(-4)}`;

    // 1. Find existing user in PostgreSQL
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ auth0Id }, { email }],
      },
      include: {
        accounts: {
          where: { isArchived: false },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // 2. If user does not exist in DB yet, auto-provision user & initial Demo account
    if (!user) {
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name,
          username,
          avatarUrl,
          accounts: {
            create: {
              // User baru selalu mendapat akun Demo terlebih dahulu dengan broker "-"
              name: "Personal Demo Account",
              broker: "-",
              accountType: "Demo",
              initialBalance: 10000,
              currentBalance: 10000,
              currency: "USD",
              isPublic: false,
              publicSlug: `demo-${username.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            },
          },
        },
        include: {
          accounts: true,
        },
      });
    } else if (user.accounts.length === 0) {
      // Jika user ada tapi belum punya akun, buat akun Demo default dengan broker "-"
      const defaultAccount = await prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: "Personal Demo Account",
          broker: "-",
          accountType: "Demo",
          initialBalance: 10000,
          currentBalance: 10000,
          currency: "USD",
          isPublic: false,
          publicSlug: `demo-${username.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        },
      });
      user.accounts = [defaultAccount];
    }

    return {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name || name,
      username: user.username || username,
      avatarUrl: user.avatarUrl || avatarUrl,
      accounts: user.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        broker: a.broker,
        accountType: a.accountType,
        currentBalance: Number(a.currentBalance),
        currency: a.currency,
        isPublic: a.isPublic,
        publicSlug: a.publicSlug,
      })),
    };
  } catch (error) {
    console.warn("Auth0 getCurrentUser session lookup info:", error);
    return null;
  }
}
