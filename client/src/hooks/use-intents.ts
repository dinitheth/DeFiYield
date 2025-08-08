import { useState, useEffect, useCallback } from "react";
import { intentStorage } from "../lib/intent-storage";
import { intentMatcher } from "../lib/intent-matcher";
import { Intent, CreateIntentData, IntentMatch } from "../types/intent";
import { useToast } from "./use-toast";

export function useIntents() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [userIntents, setUserIntents] = useState<Intent[]>([]);
  const [matches, setMatches] = useState<IntentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const loadIntents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean up expired intents first
      await intentStorage.cleanup();

      // Load all active intents
      const allIntents = await intentStorage.getActiveIntents();
      setIntents(allIntents);

      // Find all possible matches
      const allMatches = intentMatcher.getAllTradingPairs(allIntents);
      setMatches(allMatches);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load intents";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadUserIntents = useCallback(async (userAddress: string) => {
    try {
      const userIntentsList = await intentStorage.getUserIntents(userAddress);
      setUserIntents(userIntentsList);
    } catch (err: any) {
      console.error("Failed to load user intents:", err);
    }
  }, []);

  const createIntent = useCallback(async (data: CreateIntentData) => {
    try {
      const newIntent = await intentStorage.createIntent(data);
      
      toast({
        title: "Intent Created",
        description: "Your trade intent has been stored locally and is now active",
      });

      // Reload intents to include the new one
      await loadIntents();
      
      if (data.creatorAddress) {
        await loadUserIntents(data.creatorAddress);
      }

      return newIntent;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create intent";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [loadIntents, loadUserIntents, toast]);

  const fulfillIntent = useCallback(async (intentId: string, userAddress: string) => {
    try {
      const intent = await intentStorage.getIntent(intentId);
      if (!intent) {
        throw new Error("Intent not found");
      }

      if (intent.status !== "active") {
        throw new Error("Intent is no longer active");
      }

      // Mark intent as matched (will be fulfilled after transaction)
      await intentStorage.updateIntent(intentId, { 
        status: "matched",
        updatedAt: new Date()
      });

      toast({
        title: "Intent Matched",
        description: "Intent marked for fulfillment. Please sign the transaction.",
      });

      // Reload intents to reflect the change
      await loadIntents();
      
      if (userAddress) {
        await loadUserIntents(userAddress);
      }

      return intent;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fulfill intent";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [loadIntents, loadUserIntents, toast]);

  const markIntentFulfilled = useCallback(async (intentId: string, txHash: string) => {
    try {
      await intentStorage.updateIntent(intentId, { 
        status: "fulfilled",
        updatedAt: new Date()
      });

      toast({
        title: "Trade Completed",
        description: "Your intent has been successfully fulfilled!",
      });

      // Reload intents
      await loadIntents();
    } catch (err: any) {
      console.error("Failed to mark intent as fulfilled:", err);
    }
  }, [loadIntents, toast]);

  const deleteIntent = useCallback(async (intentId: string, userAddress: string) => {
    try {
      await intentStorage.deleteIntent(intentId);
      
      toast({
        title: "Intent Deleted",
        description: "Intent has been removed",
      });

      await loadIntents();
      await loadUserIntents(userAddress);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete intent";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [loadIntents, loadUserIntents, toast]);

  const findMatchesForIntent = useCallback((intentId: string): IntentMatch[] => {
    const targetIntent = intents.find(i => i.id === intentId);
    if (!targetIntent) return [];

    return intentMatcher.findMatches(targetIntent, intents);
  }, [intents]);

  useEffect(() => {
    loadIntents();
  }, [loadIntents]);

  return {
    intents,
    userIntents,
    matches,
    loading,
    error,
    createIntent,
    fulfillIntent,
    markIntentFulfilled,
    deleteIntent,
    findMatchesForIntent,
    loadIntents,
    loadUserIntents,
  };
}
