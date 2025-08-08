import { useState, useEffect, useCallback } from "react";
import { namadaWallet } from "../lib/namada-wallet";
import { useToast } from "./use-toast";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  balances: Record<string, string>;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
    balances: {},
  });

  const { toast } = useToast();

  const checkConnection = useCallback(async () => {
    try {
      const isAvailable = await namadaWallet.isAvailable();
      if (!isAvailable) {
        setState(prev => ({ 
          ...prev, 
          error: "Namada Keychain extension not found" 
        }));
        return;
      }

      const isConnected = namadaWallet.isConnected();
      const address = namadaWallet.getCurrentAddress();

      setState(prev => ({
        ...prev,
        isConnected,
        address,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      const isAvailable = await namadaWallet.isAvailable();
      if (!isAvailable) {
        throw new Error(
          "Namada Keychain extension not found. Please install it from the Chrome Web Store."
        );
      }

      const address = await namadaWallet.connect();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        address,
        isConnecting: false,
        error: null,
      }));

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Namada Keychain",
      });

      // Load initial balances
      await loadBalances();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to connect wallet";
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    try {
      await namadaWallet.disconnect();
      setState({
        isConnected: false,
        address: null,
        isConnecting: false,
        error: null,
        balances: {},
      });

      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error: any) {
      console.error("Failed to disconnect wallet:", error);
    }
  }, [toast]);

  const loadBalances = useCallback(async () => {
    if (!state.isConnected || !state.address) return;

    try {
      const tokens = ["NAM", "ATOM", "OSMO", "USDC"];
      const balances: Record<string, string> = {};

      for (const token of tokens) {
        try {
          const balance = await namadaWallet.getBalance(token);
          balances[token] = balance;
        } catch (error) {
          console.warn(`Failed to get balance for ${token}:`, error);
          balances[token] = "0";
        }
      }

      setState(prev => ({ ...prev, balances }));
    } catch (error) {
      console.error("Failed to load balances:", error);
    }
  }, [state.isConnected, state.address]);

  const signAndSubmitTransaction = useCallback(async (tx: any) => {
    if (!state.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      const txHash = await namadaWallet.signAndSubmitTx(tx);
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });

      // Reload balances after transaction
      setTimeout(loadBalances, 2000);

      return txHash;
    } catch (error: any) {
      const errorMessage = error.message || "Transaction failed";
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [state.isConnected, toast, loadBalances]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    connect,
    disconnect,
    loadBalances,
    signAndSubmitTransaction,
  };
}
