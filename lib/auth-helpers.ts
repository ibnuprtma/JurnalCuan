import { auth0 } from "./auth0";
import { prisma } from "./prisma";

export interface CurrentUserSession {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  username: string;
  currency: string;
  timezone: string;
  avatarUrl?: string | null;
}

export const DEMO_USER: CurrentUserSession = {
  id: "demo-trader-uuid-12345",
  auth0Id: "auth0|demo-trader-12345",
  email: "trader@jurnalcuan.com",
  name: "Cuan Master",
  username: "cuanmaster",
  currency: "USD",
  timezone: "Asia/Jakarta",
  avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
};

export async function getCurrentUser(): Promise<CurrentUserSession> {
  try {
    const hasAuth0Config = Boolean(
      process.env.AUTH0_DOMAIN && 
      process.env.AUTH0_CLIENT_ID && 
      process.env.AUTH0_SECRET &&
      !process.env.AUTH0_DOMAIN.includes("demo")
    );

    if (hasAuth0Config) {
      const session = await auth0.getSession();
      if (session?.user) {
        const auth0User = session.user;
        const auth0Id = auth0User.sub || `auth0|${auth0User.email}`;
        const email = auth0User.email || `${auth0Id}@user.jurnalcuan.com`;
        const name = auth0User.name || auth0User.nickname || "Forex Trader";
        const avatarUrl = auth0User.picture || null;
        const generatedUsername = (auth0User.nickname || email.split("@")[0] || "trader").toLowerCase().replace(/[^a-z0-9_-]/g, "");

        // Sync or Create user in Database
        try {
          const user = await prisma.user.upsert({
            where: { auth0Id },
            update: {
              email,
              name,
              avatarUrl,
            },
            create: {
              auth0Id,
              email,
              name,
              username: generatedUsername,
              avatarUrl,
              currency: "USD",
              timezone: "Asia/Jakarta",
              accounts: {
                create: {
                  name: "Akun Real Utama",
                  broker: "Exness",
                  accountType: "Real",
                  initialBalance: 1000.0,
                  currentBalance: 1000.0,
                  currency: "USD",
                  syncMethod: "MANUAL_ENTRY",
                  publicSlug: "main-account",
                },
              },
            },
          });

          return {
            id: user.id,
            auth0Id: user.auth0Id,
            email: user.email,
            name: user.name || "Trader",
            username: user.username || generatedUsername,
            currency: user.currency,
            timezone: user.timezone,
            avatarUrl: user.avatarUrl,
          };
        } catch (dbError) {
          console.error("Database user sync error, fallback to session:", dbError);
          return {
            id: auth0Id,
            auth0Id,
            email,
            name,
            username: generatedUsername,
            currency: "USD",
            timezone: "Asia/Jakarta",
            avatarUrl,
          };
        }
      }
    }
  } catch (error) {
    console.warn("Auth0 session check skipped or failed, using demo session:", error);
  }

  // Dev & Demo Fallback User
  try {
    const existingDemo = await prisma.user.findUnique({
      where: { auth0Id: DEMO_USER.auth0Id },
    });

    if (!existingDemo) {
      const created = await prisma.user.create({
        data: {
          id: DEMO_USER.id,
          auth0Id: DEMO_USER.auth0Id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          username: DEMO_USER.username,
          currency: DEMO_USER.currency,
          timezone: DEMO_USER.timezone,
          avatarUrl: DEMO_USER.avatarUrl,
          accounts: {
            create: [
              {
                id: "demo-account-1",
                name: "Personal Real Account",
                broker: "Exness MT5",
                accountType: "Real",
                initialBalance: 5000.0,
                currentBalance: 5850.0,
                currency: "USD",
                syncMethod: "MANUAL_ENTRY",
                publicSlug: "personal-real",
                isPublic: true,
              },
              {
                id: "demo-account-2",
                name: "FTMO 100k Challenge",
                broker: "FTMO MT5",
                accountType: "PropFirm",
                initialBalance: 100000.0,
                currentBalance: 104250.0,
                currency: "USD",
                syncMethod: "MT5_FILE_IMPORT",
                publicSlug: "ftmo-100k",
                isPublic: false,
              }
            ],
          },
        },
      });
      return {
        id: created.id,
        auth0Id: created.auth0Id,
        email: created.email,
        name: created.name || DEMO_USER.name,
        username: created.username || DEMO_USER.username,
        currency: created.currency,
        timezone: created.timezone,
        avatarUrl: created.avatarUrl,
      };
    }

    return {
      id: existingDemo.id,
      auth0Id: existingDemo.auth0Id,
      email: existingDemo.email,
      name: existingDemo.name || DEMO_USER.name,
      username: existingDemo.username || DEMO_USER.username,
      currency: existingDemo.currency,
      timezone: existingDemo.timezone,
      avatarUrl: existingDemo.avatarUrl,
    };
  } catch (e) {
    // If DB is temporarily not connected during build
    return DEMO_USER;
  }
}
