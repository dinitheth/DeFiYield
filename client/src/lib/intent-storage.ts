import { Intent, CreateIntentData } from "../types/intent";

class IntentStorage {
  private dbName = "intentmesh-db";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create intents store
        if (!db.objectStoreNames.contains("intents")) {
          const intentStore = db.createObjectStore("intents", { keyPath: "id" });
          intentStore.createIndex("status", "status", { unique: false });
          intentStore.createIndex("creatorAddress", "creatorAddress", { unique: false });
          intentStore.createIndex("fromToken", "fromToken", { unique: false });
          intentStore.createIndex("toToken", "toToken", { unique: false });
        }

        // Create transactions store
        if (!db.objectStoreNames.contains("transactions")) {
          const txStore = db.createObjectStore("transactions", { keyPath: "id" });
          txStore.createIndex("intentId", "intentId", { unique: false });
          txStore.createIndex("status", "status", { unique: false });
        }
      };
    });
  }

  async createIntent(data: CreateIntentData): Promise<Intent> {
    if (!this.db) await this.init();

    const intent: Intent = {
      id: this.generateId(),
      ...data,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["intents"], "readwrite");
      const store = transaction.objectStore("intents");
      const request = store.add(intent);

      request.onsuccess = () => resolve(intent);
      request.onerror = () => reject(request.error);
    });
  }

  async getIntents(filters?: {
    status?: string;
    fromToken?: string;
    toToken?: string;
    creatorAddress?: string;
  }): Promise<Intent[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["intents"], "readonly");
      const store = transaction.objectStore("intents");
      const request = store.getAll();

      request.onsuccess = () => {
        let intents = request.result;

        // Apply filters
        if (filters) {
          intents = intents.filter((intent) => {
            if (filters.status && intent.status !== filters.status) return false;
            if (filters.fromToken && intent.fromToken !== filters.fromToken) return false;
            if (filters.toToken && intent.toToken !== filters.toToken) return false;
            if (filters.creatorAddress && intent.creatorAddress !== filters.creatorAddress) return false;
            return true;
          });
        }

        // Sort by creation date (newest first)
        intents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        resolve(intents);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getIntent(id: string): Promise<Intent | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["intents"], "readonly");
      const store = transaction.objectStore("intents");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateIntent(id: string, updates: Partial<Intent>): Promise<Intent> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["intents"], "readwrite");
      const store = transaction.objectStore("intents");
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const intent = getRequest.result;
        if (!intent) {
          reject(new Error("Intent not found"));
          return;
        }

        const updatedIntent = {
          ...intent,
          ...updates,
          updatedAt: new Date(),
        };

        const updateRequest = store.put(updatedIntent);
        updateRequest.onsuccess = () => resolve(updatedIntent);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteIntent(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["intents"], "readwrite");
      const store = transaction.objectStore("intents");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserIntents(address: string): Promise<Intent[]> {
    return this.getIntents({ creatorAddress: address });
  }

  async getActiveIntents(): Promise<Intent[]> {
    return this.getIntents({ status: "active" });
  }

  private generateId(): string {
    return `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async cleanup(): Promise<void> {
    // Remove expired intents
    const allIntents = await this.getIntents();
    const now = new Date();

    for (const intent of allIntents) {
      const expiryDate = new Date(intent.expiry);
      if (expiryDate < now && intent.status === "active") {
        await this.updateIntent(intent.id, { status: "expired" });
      }
    }
  }
}

export const intentStorage = new IntentStorage();
