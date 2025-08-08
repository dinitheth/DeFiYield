import React from "react";
import { Wallet, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletContext } from "./wallet-provider";
import { useToast } from "@/hooks/use-toast";

export function WalletConnector() {
  const { 
    isConnected, 
    address, 
    isConnecting, 
    error, 
    connect, 
    disconnect 
  } = useWalletContext();
  const { toast } = useToast();

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard",
        });
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3 bg-accent px-4 py-2 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Connected</span>
          <span className="font-mono text-sm text-foreground">
            {formatAddress(address)}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={copyAddress}>
          <Copy className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gradient-border"
      >
        <div className="gradient-border-inner px-4 py-2 flex items-center space-x-2">
          <Wallet className="w-4 h-4" />
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
        </div>
      </Button>
      
      {error && (
        <div className="flex items-center space-x-1 text-destructive text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>Keychain not found</span>
        </div>
      )}
    </div>
  );
}