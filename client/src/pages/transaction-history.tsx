import React, { useState, useEffect } from "react";
import { ExternalLink, TrendingUp, CheckCircle, Shield, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWalletContext } from "@/components/wallet-provider";
import { useIntents } from "@/hooks/use-intents";

interface TransactionRecord {
  id: string;
  date: Date;
  fromToken: string;
  fromAmount: string;
  toToken: string;
  toAmount: string;
  txHash: string;
  status: "completed" | "pending" | "failed";
  value: string;
}

export default function TransactionHistory() {
  const { isConnected, address } = useWalletContext();
  const { userIntents, loadUserIntents } = useIntents();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      loadUserIntents(address);
    }
  }, [isConnected, address, loadUserIntents]);

  useEffect(() => {
    // Convert fulfilled intents to transaction records
    const fulfilledIntents = userIntents.filter(intent => intent.status === "fulfilled");
    
    const transactionRecords: TransactionRecord[] = fulfilledIntents.map(intent => ({
      id: intent.id,
      date: intent.updatedAt,
      fromToken: intent.fromToken,
      fromAmount: intent.fromAmount,
      toToken: intent.toToken,
      toAmount: intent.toAmount,
      txHash: `0x${Math.random().toString(16).slice(2, 18)}...`, // Mock hash
      status: "completed" as const,
      value: `$${(parseFloat(intent.fromAmount) * 6.5).toFixed(2)}`, // Mock USD value
    }));

    setTransactions(transactionRecords);
  }, [userIntents]);

  useEffect(() => {
    const filtered = transactions.filter(tx =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toToken.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm]);

  const getTotalStats = () => {
    const completed = transactions.filter(tx => tx.status === "completed").length;
    const totalVolume = transactions.reduce((sum, tx) => 
      sum + parseFloat(tx.value.replace("$", "").replace(",", "")), 0
    );
    
    return {
      completed,
      totalVolume: totalVolume.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      shieldedPercentage: 100, // All transactions are shielded
    };
  };

  const openExplorer = (txHash: string) => {
    // Open Namada explorer - using placeholder URL
    window.open(`https://explorer.namada.net/tx/${txHash}`, "_blank");
  };

  const stats = getTotalStats();

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card>
          <CardContent className="p-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground mb-8">
              Please connect your Namada Keychain wallet to view your transaction history.
            </p>
            <Button>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Transaction History
        </h1>
        <p className="text-lg text-muted-foreground">
          View your completed intent fulfillments and transaction details.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed Trades</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stats.totalVolume}</div>
            <div className="text-sm text-muted-foreground">Across All Assets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground">Privacy</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stats.shieldedPercentage}%</div>
            <div className="text-sm text-muted-foreground">Shielded Transfers</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions by ID, hash, or token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {transactions.length === 0 ? "No Transactions Yet" : "No Results Found"}
              </h3>
              <p className="text-muted-foreground">
                {transactions.length === 0 
                  ? "Complete your first trade to see transaction history here."
                  : "Try adjusting your search terms."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="text-sm text-foreground">
                            {tx.date.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.date.toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">
                            {parseFloat(tx.fromAmount).toLocaleString()} {tx.fromToken}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm font-medium text-foreground">
                            {parseFloat(tx.toAmount).toLocaleString()} {tx.toToken}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-foreground">
                        {tx.value}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          className={
                            tx.status === "completed" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openExplorer(tx.txHash)}
                          className="flex items-center space-x-1 text-primary hover:text-primary/80"
                        >
                          <span className="font-mono text-xs">
                            {tx.txHash.slice(0, 8)}...
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
