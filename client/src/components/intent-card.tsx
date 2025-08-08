import React from "react";
import { ArrowRight, Clock, Shield, Zap, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Intent } from "../types/intent";
import { SUPPORTED_TOKENS } from "@shared/schema";

interface IntentCardProps {
  intent: Intent;
  isMatch?: boolean;
  onFulfill?: (intentId: string) => void;
  onViewDetails?: (intentId: string) => void;
  showActions?: boolean;
}

export function IntentCard({ 
  intent, 
  isMatch = false, 
  onFulfill, 
  onViewDetails,
  showActions = true 
}: IntentCardProps) {
  const getTokenInfo = (symbol: string) => {
    return SUPPORTED_TOKENS.find(t => t.symbol === symbol) || { 
      symbol, 
      name: symbol, 
      decimals: 6 
    };
  };

  const fromToken = getTokenInfo(intent.fromToken);
  const toToken = getTokenInfo(intent.toToken);

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(intent.expiry);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = () => {
    switch (intent.status) {
      case "active": return isMatch ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "matched": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "fulfilled": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "expired": return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const isExpired = new Date(intent.expiry) <= new Date();
  const canFulfill = intent.status === "active" && !isExpired && showActions && onFulfill;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isMatch ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10" : ""
    }`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isMatch && (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-soft"></div>
            )}
            <Badge className={getStatusColor()}>
              {isMatch ? "Compatible Match" : intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
            </Badge>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{getTimeRemaining()}</span>
            </div>
            <div className="font-mono text-xs mt-1">
              {intent.id.slice(0, 12)}...
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
          {/* From Token */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Offering</div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                fromToken.symbol === "NAM" ? "bg-gradient-to-br from-teal-500 to-teal-600" :
                fromToken.symbol === "ATOM" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                fromToken.symbol === "OSMO" ? "bg-gradient-to-br from-purple-500 to-purple-600" :
                "bg-gradient-to-br from-green-500 to-green-600"
              }`}>
                {fromToken.symbol[0]}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {parseFloat(intent.fromAmount).toLocaleString()} {fromToken.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  {fromToken.name}
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-full">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">for</span>
            </div>
          </div>

          {/* To Token */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Wanting</div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                toToken.symbol === "NAM" ? "bg-gradient-to-br from-teal-500 to-teal-600" :
                toToken.symbol === "ATOM" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                toToken.symbol === "OSMO" ? "bg-gradient-to-br from-purple-500 to-purple-600" :
                "bg-gradient-to-br from-green-500 to-green-600"
              }`}>
                {toToken.symbol[0]}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {parseFloat(intent.toAmount).toLocaleString()} {toToken.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  {toToken.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>Shielded Execution</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Created {new Date(intent.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3">
            {canFulfill && (
              <Button 
                onClick={() => onFulfill(intent.id)}
                className="flex-1 gradient-border group hover:scale-[1.02] transition-all duration-200"
              >
                <div className="gradient-border-inner px-6 py-3 flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Fulfill Intent</span>
                </div>
              </Button>
            )}
            
            {!canFulfill && intent.status === "active" && isExpired && (
              <Button disabled className="flex-1">
                Expired
              </Button>
            )}
            
            {!canFulfill && intent.status === "fulfilled" && (
              <Button disabled className="flex-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Fulfilled
              </Button>
            )}
            
            {!canFulfill && intent.status === "matched" && (
              <Button disabled className="flex-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                Processing...
              </Button>
            )}
            
            {onViewDetails && (
              <Button 
                variant="outline" 
                onClick={() => onViewDetails(intent.id)}
                className="px-6 py-3"
              >
                Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
