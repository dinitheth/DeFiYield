import { z } from "zod";

// Intent Schema
export const intentSchema = z.object({
  id: z.string(),
  fromToken: z.string().min(1, "From token is required"),
  fromAmount: z.string().min(1, "From amount is required"),
  toToken: z.string().min(1, "To token is required"),
  toAmount: z.string().min(1, "To amount is required"),
  expiry: z.string(),
  creatorAddress: z.string(),
  status: z.enum(["active", "matched", "fulfilled", "expired"]).default("active"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const createIntentSchema = intentSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type Intent = z.infer<typeof intentSchema>;
export type CreateIntent = z.infer<typeof createIntentSchema>;

// Transaction Schema
export const transactionSchema = z.object({
  id: z.string(),
  intentId: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  fromToken: z.string(),
  fromAmount: z.string(),
  toToken: z.string(),
  toAmount: z.string(),
  txHash: z.string(),
  blockHeight: z.number().optional(),
  status: z.enum(["pending", "confirmed", "failed"]),
  timestamp: z.date(),
  isShielded: z.boolean().default(true),
});

export type Transaction = z.infer<typeof transactionSchema>;

// Wallet Schema
export const walletSchema = z.object({
  address: z.string(),
  isConnected: z.boolean(),
  chainId: z.string().optional(),
  balance: z.record(z.string(), z.string()).default({}),
});

export type Wallet = z.infer<typeof walletSchema>;

// Supported tokens on Namada
export const SUPPORTED_TOKENS = [
  { symbol: "NAM", name: "Namada", decimals: 6 },
  { symbol: "ATOM", name: "Cosmos Hub", decimals: 6 },
  { symbol: "OSMO", name: "Osmosis", decimals: 6 },
  { symbol: "USDC", name: "USD Coin", decimals: 6 },
] as const;

export type SupportedToken = typeof SUPPORTED_TOKENS[number];
