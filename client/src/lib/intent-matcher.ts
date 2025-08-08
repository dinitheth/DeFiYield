import { Intent, IntentMatch } from "../types/intent";

export class IntentMatcher {
  // Find compatible intents for trading
  findMatches(targetIntent: Intent, availableIntents: Intent[]): IntentMatch[] {
    const matches: IntentMatch[] = [];

    for (const intent of availableIntents) {
      // Skip self and non-active intents
      if (intent.id === targetIntent.id || intent.status !== "active") {
        continue;
      }

      // Check for direct token pair match
      const isDirectMatch = 
        targetIntent.fromToken === intent.toToken &&
        targetIntent.toToken === intent.fromToken;

      if (isDirectMatch) {
        const compatibilityScore = this.calculateCompatibilityScore(targetIntent, intent);
        const canFulfill = this.canFulfillIntent(targetIntent, intent);

        matches.push({
          intentA: targetIntent,
          intentB: intent,
          compatibilityScore,
          canFulfill,
        });
      }
    }

    // Sort by compatibility score (highest first)
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  // Calculate how well two intents match (0-100 score)
  private calculateCompatibilityScore(intentA: Intent, intentB: Intent): number {
    let score = 0;

    // Base score for token pair match
    if (intentA.fromToken === intentB.toToken && intentA.toToken === intentB.fromToken) {
      score += 40;
    }

    // Amount compatibility
    const amountA = parseFloat(intentA.fromAmount);
    const amountB = parseFloat(intentB.toAmount);
    const amountRatio = Math.min(amountA, amountB) / Math.max(amountA, amountB);
    score += amountRatio * 30;

    // Time until expiry (newer/longer expiry = better)
    const expiryA = new Date(intentA.expiry).getTime();
    const expiryB = new Date(intentB.expiry).getTime();
    const now = Date.now();
    const timeScoreA = Math.min((expiryA - now) / (24 * 60 * 60 * 1000), 1); // normalize to days
    const timeScoreB = Math.min((expiryB - now) / (24 * 60 * 60 * 1000), 1);
    score += (timeScoreA + timeScoreB) * 15;

    // Exact amount match bonus
    if (amountA === amountB) {
      score += 15;
    }

    return Math.min(Math.round(score), 100);
  }

  // Check if an intent can be fulfilled
  private canFulfillIntent(intentA: Intent, intentB: Intent): boolean {
    // Check if tokens match
    const tokensMatch = 
      intentA.fromToken === intentB.toToken &&
      intentA.toToken === intentB.fromToken;

    if (!tokensMatch) return false;

    // Check if amounts are compatible (allow some tolerance)
    const amountA = parseFloat(intentA.fromAmount);
    const amountB = parseFloat(intentB.toAmount);
    const tolerance = 0.01; // 1% tolerance
    const isAmountCompatible = Math.abs(amountA - amountB) / Math.max(amountA, amountB) <= tolerance;

    // Check if not expired
    const now = new Date();
    const notExpiredA = new Date(intentA.expiry) > now;
    const notExpiredB = new Date(intentB.expiry) > now;

    return isAmountCompatible && notExpiredA && notExpiredB;
  }

  // Find the best match for a specific intent
  findBestMatch(targetIntent: Intent, availableIntents: Intent[]): IntentMatch | null {
    const matches = this.findMatches(targetIntent, availableIntents);
    return matches.length > 0 ? matches[0] : null;
  }

  // Get all possible trading pairs from available intents
  getAllTradingPairs(intents: Intent[]): IntentMatch[] {
    const pairs: IntentMatch[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < intents.length; i++) {
      for (let j = i + 1; j < intents.length; j++) {
        const intentA = intents[i];
        const intentB = intents[j];
        
        // Create unique pair ID to avoid duplicates
        const pairId = [intentA.id, intentB.id].sort().join("-");
        if (processed.has(pairId)) continue;

        const canMatch = this.canFulfillIntent(intentA, intentB);
        if (canMatch) {
          const compatibilityScore = this.calculateCompatibilityScore(intentA, intentB);
          pairs.push({
            intentA,
            intentB,
            compatibilityScore,
            canFulfill: true,
          });
          processed.add(pairId);
        }
      }
    }

    return pairs.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}

export const intentMatcher = new IntentMatcher();
