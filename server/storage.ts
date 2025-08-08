import { type Intent, type Transaction } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for IntentMesh
export interface IStorage {
  getIntent(id: string): Promise<Intent | undefined>;
  createIntent(intent: Omit<Intent, 'id'>): Promise<Intent>;
  getIntents(): Promise<Intent[]>;
  updateIntent(id: string, updates: Partial<Intent>): Promise<Intent | undefined>;
  deleteIntent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private intents: Map<string, Intent>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.intents = new Map();
    this.transactions = new Map();
  }

  async getIntent(id: string): Promise<Intent | undefined> {
    return this.intents.get(id);
  }

  async createIntent(intentData: Omit<Intent, 'id'>): Promise<Intent> {
    const id = randomUUID();
    const intent: Intent = { ...intentData, id };
    this.intents.set(id, intent);
    return intent;
  }

  async getIntents(): Promise<Intent[]> {
    return Array.from(this.intents.values());
  }

  async updateIntent(id: string, updates: Partial<Intent>): Promise<Intent | undefined> {
    const existing = this.intents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.intents.set(id, updated);
    return updated;
  }

  async deleteIntent(id: string): Promise<boolean> {
    return this.intents.delete(id);
  }
}

export const storage = new MemStorage();
