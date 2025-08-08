import React, { createContext, useContext, useEffect, useState } from "react";
import { NamadaWallet } from "@/lib/namada-wallet";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = NamadaWallet.getInstance();

  const connect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const connectedAddress = await wallet.connect();
      setAddress(connectedAddress);
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      setIsConnected(false);
      setAddress(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await wallet.disconnect();
      setIsConnected(false);
      setAddress(null);
      setError(null);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isAvailable = await wallet.isAvailable();
        if (isAvailable) {
          const walletAddress = await wallet.getAddress();
          if (walletAddress) {
            setAddress(walletAddress);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.warn("Failed to check wallet connection:", err);
      }
    };

    checkConnection();
  }, []);

  const value: WalletContextType = {
    isConnected,
    address,
    isConnecting,
    error,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}