import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntentCard } from "@/components/intent-card";
import { useIntents } from "@/hooks/use-intents";
import { useWalletContext } from "@/components/wallet-provider";
import { intentMatcher } from "@/lib/intent-matcher";
import { SUPPORTED_TOKENS } from "@shared/schema";
import { Intent, IntentMatch } from "@/types/intent";

export default function ExploreIntents() {
  const { intents, loading, fulfillIntent, loadIntents } = useIntents();
  const { address, isConnected, signAndSubmitTransaction } = useWalletContext();
  const [filteredIntents, setFilteredIntents] = useState<Intent[]>([]);
  const [matches, setMatches] = useState<IntentMatch[]>([]);
  const [filters, setFilters] = useState({
    fromToken: "",
    toToken: "",
    amountRange: "",
    search: "",
  });

  useEffect(() => {
    let filtered = intents.filter(intent => intent.status === "active");

    // Apply filters
    if (filters.fromToken) {
      filtered = filtered.filter(intent => intent.fromToken === filters.fromToken);
    }
    if (filters.toToken) {
      filtered = filtered.filter(intent => intent.toToken === filters.toToken);
    }
    if (filters.amountRange) {
      filtered = filtered.filter(intent => {
        const amount = parseFloat(intent.fromAmount);
        switch (filters.amountRange) {
          case "small": return amount < 100;
          case "medium": return amount >= 100 && amount <= 1000;
          case "large": return amount > 1000;
          default: return true;
        }
      });
    }
    if (filters.search) {
      filtered = filtered.filter(intent =>
        intent.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        intent.fromToken.toLowerCase().includes(filters.search.toLowerCase()) ||
        intent.toToken.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredIntents(filtered);

    // Find matches for user's potential trades
    if (isConnected && address) {
      const userMatches = intentMatcher.getAllTradingPairs(filtered);
      setMatches(userMatches);
    }
  }, [intents, filters, isConnected, address]);

  const handleFulfillIntent = async (intentId: string) => {
    if (!isConnected || !address) {
      return;
    }

    try {
      // First mark intent as matched
      const intent = await fulfillIntent(intentId, address);
      
      if (!intent) return;

      // Create shielded transfer transaction
      const tx = {
        type: "shielded_transfer",
        from: address,
        to: intent.creatorAddress,
        fromToken: intent.toToken,
        fromAmount: intent.toAmount,
        toToken: intent.fromToken,
        toAmount: intent.fromAmount,
        timestamp: Date.now(),
      };

      // Sign and submit transaction
      await signAndSubmitTransaction(tx);
      
    } catch (error) {
      console.error("Failed to fulfill intent:", error);
    }
  };

  const handleRefresh = () => {
    loadIntents();
  };

  const resetFilters = () => {
    setFilters({
      fromToken: "",
      toToken: "",
      amountRange: "",
      search: "",
    });
  };

  const compatibleIntents = filteredIntents.filter(intent => 
    matches.some(match => match.intentA.id === intent.id || match.intentB.id === intent.id)
  );

  const otherIntents = filteredIntents.filter(intent => 
    !matches.some(match => match.intentA.id === intent.id || match.intentB.id === intent.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Explore Intents
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse compatible trading intents and fulfill matches.
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{intents.length}</div>
              <div className="text-sm text-muted-foreground">Total Intents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{compatibleIntents.length}</div>
              <div className="text-sm text-muted-foreground">Compatible</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{matches.length}</div>
              <div className="text-sm text-muted-foreground">Possible Pairs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-muted-foreground">Shielded</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search intents..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From Token
              </label>
              <Select
                value={filters.fromToken}
                onValueChange={(value) => setFilters(prev => ({ ...prev, fromToken: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tokens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tokens</SelectItem>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                To Token
              </label>
              <Select
                value={filters.toToken}
                onValueChange={(value) => setFilters(prev => ({ ...prev, toToken: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tokens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tokens</SelectItem>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount Range
              </label>
              <Select
                value={filters.amountRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, amountRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any amount</SelectItem>
                  <SelectItem value="small">{"< 100"}</SelectItem>
                  <SelectItem value="medium">100 - 1,000</SelectItem>
                  <SelectItem value="large">{"> 1,000"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading intents...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Compatible Matches */}
          {compatibleIntents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Compatible Matches</span>
              </h2>
              <div className="space-y-4">
                {compatibleIntents.map((intent) => (
                  <IntentCard
                    key={intent.id}
                    intent={intent}
                    isMatch={true}
                    onFulfill={handleFulfillIntent}
                    showActions={isConnected}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Active Intents */}
          {otherIntents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Active Intents
              </h2>
              <div className="space-y-4">
                {otherIntents.map((intent) => (
                  <IntentCard
                    key={intent.id}
                    intent={intent}
                    onFulfill={handleFulfillIntent}
                    showActions={isConnected}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredIntents.length === 0 && (
            <div className="text-center py-16">
              <Card>
                <CardContent className="p-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Intents Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    No intents match your current filters. Try adjusting your search criteria.
                  </p>
                  <Button onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Load More */}
          {filteredIntents.length > 0 && (
            <div className="text-center">
              <Button variant="outline" onClick={handleRefresh}>
                Load More Intents
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
