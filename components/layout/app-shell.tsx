"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { TradeFormModal } from "@/components/trades/trade-form-modal";
import { MT5ImportDialog } from "@/components/trades/mt5-import-dialog";
import { CuanCardModal } from "@/components/share/cuan-card-modal";
import { SampleTrade, generateSampleTrades } from "@/lib/sample-data";
import { fetchTradesClient, fetchAccountsClient, saveTradeClient } from "@/lib/client-api";

import { usePathname } from "next/navigation";

interface AppShellContextValue {
  trades: SampleTrade[];
  accounts: any[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  openNewTradeModal: () => void;
  openImportModal: () => void;
  openCuanCardModal: () => void;
  handleSaveTrade: (tradeData: any) => Promise<void>;
  handleImportComplete: (importedTrades: SampleTrade[]) => void;
  refreshAccounts: () => void;
}

export const AppShellContext = React.createContext<AppShellContextValue | undefined>(undefined);

export function useAppShell() {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within AppShell");
  }
  return context;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicShareRoute = Boolean(pathname?.startsWith("/share/"));

  const [trades, setTrades] = React.useState<SampleTrade[]>([]);
  const [accounts, setAccounts] = React.useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("all");
  const [isTradeModalOpen, setIsTradeModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isCuanCardModalOpen, setIsCuanCardModalOpen] = React.useState(false);

  const loadAccounts = React.useCallback(async () => {
    try {
      const fetchedAccounts = await fetchAccountsClient();
      if (fetchedAccounts && fetchedAccounts.length > 0) setAccounts(fetchedAccounts);
    } catch (e) {
      console.warn("Error loading accounts:", e);
    }
  }, []);

  // Load trades on mount (hanya untuk halaman aplikasi berautentikasi, lewati di Landing Page / Share Page)
  React.useEffect(() => {
    if (pathname === "/" || isPublicShareRoute) return;

    async function loadData() {
      try {
        const fetchedTrades = await fetchTradesClient(selectedAccountId);
        setTrades(fetchedTrades || []);
        await loadAccounts();
      } catch (e) {
        console.warn("Error loading live database trades:", e);
      }
    }
    loadData();
  }, [pathname, isPublicShareRoute, selectedAccountId, loadAccounts]);

  const handleSaveTrade = async (tradeData: any) => {
    const saved = await saveTradeClient(tradeData);
    setTrades((prev) => [saved, ...prev]);
  };

  const handleImportComplete = (imported: SampleTrade[]) => {
    setTrades((prev) => {
      const map = new Map(prev.map((t) => [t.ticketId, t]));
      imported.forEach((t) => map.set(t.ticketId, t));
      return Array.from(map.values());
    });
  };

  // Filter trades based on selected account
  const activeTrades = React.useMemo(() => {
    if (selectedAccountId === "all") return trades;
    return trades.filter((t) => t.accountId === selectedAccountId);
  }, [trades, selectedAccountId]);

  const isLandingRoute = pathname === "/";
  const isStandaloneRoute = isPublicShareRoute || isLandingRoute;

  // If this is a public share page or landing page, render standalone view without sidebar/header
  if (isStandaloneRoute) {
    return (
      <AppShellContext.Provider
        value={{
          trades: activeTrades,
          accounts,
          selectedAccountId,
          setSelectedAccountId,
          openNewTradeModal: () => setIsTradeModalOpen(true),
          openImportModal: () => setIsImportModalOpen(true),
          openCuanCardModal: () => setIsCuanCardModalOpen(true),
          handleSaveTrade,
          handleImportComplete,
          refreshAccounts: loadAccounts,
        }}
      >
        <main className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
          {children}
        </main>
      </AppShellContext.Provider>
    );
  }

  return (
    <AppShellContext.Provider
      value={{
        trades: activeTrades,
        accounts,
        selectedAccountId,
        setSelectedAccountId,
        openNewTradeModal: () => setIsTradeModalOpen(true),
        openImportModal: () => setIsImportModalOpen(true),
        openCuanCardModal: () => setIsCuanCardModalOpen(true),
        handleSaveTrade,
        handleImportComplete,
        refreshAccounts: loadAccounts,
      }}
    >
      <div className="flex min-h-screen bg-[#080b11] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <Header
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            onOpenNewTradeModal={() => setIsTradeModalOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>

        {/* Bottom Nav for Mobile */}
        <MobileNav />

        {/* Global Modals */}
        <TradeFormModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          onSaveTrade={handleSaveTrade}
          selectedAccountId={selectedAccountId}
        />

        <MT5ImportDialog
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={handleImportComplete}
          selectedAccountId={selectedAccountId}
        />

        <CuanCardModal
          isOpen={isCuanCardModalOpen}
          onClose={() => setIsCuanCardModalOpen(false)}
          trades={activeTrades}
          accountName={accounts.find((a) => a.id === selectedAccountId)?.name || "Portofolio"}
        />
      </div>
    </AppShellContext.Provider>
  );
}
