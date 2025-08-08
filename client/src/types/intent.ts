export interface Intent {
  id: string;
  fromToken: string;
  fromAmount: string;
  toToken: string;
  toAmount: string;
  expiry: string;
  creatorAddress: string;
  status: "active" | "matched" | "fulfilled" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntentData {
  fromToken: string;
  fromAmount: string;
  toToken: string;
  toAmount: string;
  expiry: string;
  creatorAddress: string;
}

export interface IntentMatch {
  intentA: Intent;
  intentB: Intent;
  compatibilityScore: number;
  canFulfill: boolean;
}

export interface TransactionResult {
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  blockHeight?: number;
  timestamp: Date;
}
