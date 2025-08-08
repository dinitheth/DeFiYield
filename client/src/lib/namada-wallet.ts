// Namada Keychain Wallet Integration
declare global {
  interface Window {
    namada?: {
      connect: () => Promise<string[]>;
      isConnected: () => Promise<boolean>;
      accounts: () => Promise<string[]>;
      defaultAccount: () => Promise<string | null>;
      signTx: (tx: any) => Promise<string>;
      submitTx: (signedTx: string) => Promise<string>;
      getBalance: (address: string, token: string) => Promise<string>;
      version: () => Promise<string>;
    };
    keplr?: any;
  }
}

export class NamadaWallet {
  private static instance: NamadaWallet;
  private connected: boolean = false;
  private address: string | null = null;

  private constructor() {}

  static getInstance(): NamadaWallet {
    if (!NamadaWallet.instance) {
      NamadaWallet.instance = new NamadaWallet();
    }
    return NamadaWallet.instance;
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    
    // Check if Namada Keychain extension is installed
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);
      
      const checkForNamada = () => {
        if (window.namada) {
          clearTimeout(timeout);
          resolve(true);
        }
      };
      
      checkForNamada();
      
      // Keep checking for a short period as extensions load asynchronously
      const interval = setInterval(() => {
        checkForNamada();
        if (window.namada) {
          clearInterval(interval);
        }
      }, 100);
      
      setTimeout(() => clearInterval(interval), 1000);
    });
  }

  async connect(): Promise<string> {
    if (!window.namada) {
      throw new Error("Namada Keychain extension not found. Please install it from the Chrome Web Store.");
    }

    try {
      // Try to connect and get accounts
      const accounts = await window.namada.connect();
      
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        // Fallback: try to get accounts directly
        try {
          const directAccounts = await window.namada.accounts();
          if (!directAccounts || directAccounts.length === 0) {
            throw new Error("No accounts found in Namada Keychain. Please create an account first.");
          }
          this.address = directAccounts[0];
        } catch {
          throw new Error("No accounts found in Namada Keychain. Please create an account first.");
        }
      } else {
        this.address = accounts[0];
      }

      this.connected = true;
      return this.address;
    } catch (error) {
      console.error("Failed to connect to Namada Keychain:", error);
      this.connected = false;
      this.address = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.address = null;
  }

  async getAddress(): Promise<string | null> {
    if (!window.namada) {
      return null;
    }

    try {
      // Try multiple methods to get the address
      if (window.namada.defaultAccount) {
        const defaultAddr = await window.namada.defaultAccount();
        if (defaultAddr) return defaultAddr;
      }
      
      if (window.namada.accounts) {
        const accounts = await window.namada.accounts();
        if (accounts && accounts.length > 0) {
          return accounts[0];
        }
      }

      return this.address;
    } catch (error) {
      console.error("Failed to get address:", error);
      return this.address;
    }
  }

  async getBalance(token: string): Promise<string> {
    if (!this.connected || !this.address || !window.namada) {
      throw new Error("Wallet not connected");
    }

    try {
      return await window.namada.getBalance(this.address, token);
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  async signAndSubmitTx(tx: any): Promise<string> {
    if (!this.connected || !window.namada) {
      throw new Error("Wallet not connected");
    }

    try {
      // Sign the transaction
      const signedTx = await window.namada.signTx(tx);
      
      // Submit to Namada network
      const txHash = await window.namada.submitTx(signedTx);
      
      return txHash;
    } catch (error) {
      console.error("Failed to sign and submit transaction:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getCurrentAddress(): string | null {
    return this.address;
  }

  // Create a shielded transfer transaction
  createShieldedTransfer(
    fromAddress: string,
    toAddress: string,
    token: string,
    amount: string
  ) {
    return {
      type: "shielded_transfer",
      from: fromAddress,
      to: toAddress,
      token,
      amount,
      timestamp: Date.now(),
    };
  }
}

export const namadaWallet = NamadaWallet.getInstance();
