// Namada Keychain Wallet Integration
declare global {
  interface Window {
    namada?: {
      connect: () => Promise<string[]>;
      isConnected: () => Promise<boolean>;
      getAddress: () => Promise<string>;
      signTx: (tx: any) => Promise<string>;
      submitTx: (signedTx: string) => Promise<string>;
      getBalance: (address: string, token: string) => Promise<string>;
    };
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
    return typeof window !== "undefined" && !!window.namada;
  }

  async connect(): Promise<string> {
    if (!window.namada) {
      throw new Error("Namada Keychain extension not found. Please install it from the Chrome Web Store.");
    }

    try {
      const accounts = await window.namada.connect();
      if (accounts.length === 0) {
        throw new Error("No accounts found in Namada Keychain");
      }

      this.address = accounts[0];
      this.connected = true;
      return this.address;
    } catch (error) {
      console.error("Failed to connect to Namada Keychain:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.address = null;
  }

  async getAddress(): Promise<string | null> {
    if (!this.connected || !window.namada) {
      return null;
    }

    try {
      return await window.namada.getAddress();
    } catch (error) {
      console.error("Failed to get address:", error);
      return null;
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
