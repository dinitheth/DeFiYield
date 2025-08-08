import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { WalletProvider } from "./components/wallet-provider";
import { Navigation } from "./components/navigation";
import { queryClient } from "./lib/queryClient";

// Pages
import Home from "./pages/home";
import CreateIntent from "./pages/create-intent";
import ExploreIntents from "./pages/explore-intents";
import TransactionHistory from "./pages/transaction-history";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateIntent} />
      <Route path="/explore" component={ExploreIntents} />
      <Route path="/history" component={TransactionHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="intentmesh-theme">
        <WalletProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation />
              <main>
                <Router />
              </main>
              <Toaster />
            </div>
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
