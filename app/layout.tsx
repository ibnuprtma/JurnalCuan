import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Jurnal Cuan — Modern Forex Trading Journal & Analytics",
  description:
    "Aplikasi jurnal trading forex modern dengan Kalender Cuan interaktif, integrasi MetaTrader 5, analytics performa mendalam, dan kalkulator manajemen risiko.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#080b11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#080b11] text-slate-100 min-h-screen`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
