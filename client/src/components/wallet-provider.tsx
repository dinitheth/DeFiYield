import React, { createContext, useContext } from "react";
import { useWallet } from "../hooks/use-wallet";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  balances: Record<string, string>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  loadBalances: () => Promise<void>;
  signAndSubmitTransaction: (tx: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallet = useWallet();

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
